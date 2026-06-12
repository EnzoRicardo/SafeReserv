from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import json
import base64
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

from .audit import log_audit
from .models import AuditLog, Room, Reservation
from .permissions import IsAdminRole
from .serializers import (
    AuditLogSerializer,
    RoomSerializer,
    ReservationSerializer,
)

CHAVE_SECRETA = os.getenv("AES_SECRET_KEY", "").encode("utf-8")


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAdminRole()]

    def perform_create(self, serializer):
        room = serializer.save()
        log_audit(self.request.user, "CREATE", "room", room.id)

    def perform_update(self, serializer):
        room = serializer.save()
        log_audit(self.request.user, "UPDATE", "room", room.id)

    def perform_destroy(self, instance):
        room_id = instance.id
        instance.delete()
        log_audit(self.request.user, "DELETE", "room", room_id)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Reservation.objects.all()
        return Reservation.objects.filter(user=user)

    def perform_create(self, serializer):
        reservation = serializer.save()
        log_audit(self.request.user, "CREATE", "reservation", reservation.id)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        reservation = serializer.save()

        if (
            old_status != "cancelled"
            and reservation.status == "cancelled"
        ):
            log_audit(self.request.user, "CANCEL", "reservation", reservation.id)
        else:
            log_audit(self.request.user, "UPDATE", "reservation", reservation.id)

    def create(self, request, *args, **kwargs):
        if "payload_criptografado" in request.data:
            try:
                texto_cifrado_b64 = request.data["payload_criptografado"]
                dados_cifrados = base64.b64decode(texto_cifrado_b64)

                cipher = AES.new(CHAVE_SECRETA, AES.MODE_ECB)

                dados_descriptografados = unpad(
                    cipher.decrypt(dados_cifrados), AES.block_size
                )

                request_data = json.loads(dados_descriptografados.decode("utf-8"))

            except Exception as e:
                return Response(
                    {
                        "erro": "Falha de Segurança: Descriptografia falhou",
                        "detalhes": str(e),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            request_data = request.data.copy()

        request_data["user"] = request.user.id

        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user").order_by("-created_at")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
