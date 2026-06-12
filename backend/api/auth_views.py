from datetime import timedelta

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .audit import log_audit
from .models import User
from .serializers import RegisterSerializer, UserSerializer

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=15)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        log_audit(user, "REGISTER", "user", user.id)
        tokens = get_tokens_for_user(user)
        return Response(
            {
                **tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response(
                {"erro": "E-mail e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"erro": "Credenciais inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.locked_until and user.locked_until > timezone.now():
            log_audit(user, "LOGIN_LOCKED", "user", user.id)
            return Response(
                {
                    "erro": "Conta temporariamente bloqueada. Tente novamente mais tarde."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if user.locked_until and user.locked_until <= timezone.now():
            user.failed_login_attempts = 0
            user.locked_until = None
            user.save(update_fields=["failed_login_attempts", "locked_until"])

        authenticated_user = authenticate(
            request, username=user.username, password=password
        )

        if authenticated_user is None:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = timezone.now() + LOCKOUT_DURATION
            user.save(update_fields=["failed_login_attempts", "locked_until"])
            log_audit(user, "LOGIN_FAILED", "user", user.id)

            if user.locked_until:
                return Response(
                    {
                        "erro": "Conta bloqueada após várias tentativas incorretas."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            return Response(
                {"erro": "Credenciais inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user.failed_login_attempts = 0
        user.locked_until = None
        user.save(update_fields=["failed_login_attempts", "locked_until"])
        log_audit(user, "LOGIN_SUCCESS", "user", user.id)

        tokens = get_tokens_for_user(user)
        return Response(
            {
                **tokens,
                "user": UserSerializer(user).data,
            }
        )
