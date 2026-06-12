from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import AuditLog, Room, Reservation, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "name", "role"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return value.lower()

    def validate_role(self, value):
        if value not in ("student", "teacher"):
            raise serializers.ValidationError("Tipo de usuário inválido.")
        return value

    def create(self, validated_data):
        name = validated_data.pop("name")
        email = validated_data["email"]
        password = validated_data.pop("password")
        role = validated_data.get("role", "student")

        username = email.split("@")[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name,
            role=role,
        )


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"


class ReservationSerializer(serializers.ModelSerializer):

    room_name = serializers.CharField(
        source="room.name", 
        read_only=True
    )

    class Meta:
        model = Reservation
        fields = [
            "id",
            "user",
            "room",
            "room_name",
            "reservation_date",
            "start_time",
            "end_time",
            "participants_count",
            "status",
            "created_at",
        ]

    def validate(self, data):

        start_dt = datetime.combine(
            reservation_date,
            start_time
        )

        end_dt = datetime.combine(
            reservation_date,
            end_time
        )

        if end_dt - start_dt > timedelta(hours=2):
            raise serializers.ValidationError(
                "A reserva não pode exceder 2 horas."
            )

        if data["reservation_date"] < timezone.localdate():
            raise serializers.ValidationError(
                "A data da reserva não pode ser no passado."
            )

        room = data["room"]
        reservation_date = data["reservation_date"]
        start_time = data["start_time"]
        end_time = data["end_time"]

        conflict = Reservation.objects.filter(
            room=room,
            reservation_date=reservation_date,
            start_time__lt=end_time,
            end_time__gt=start_time,
        ).exists()
        

        if conflict:
            raise serializers.ValidationError(
                "Este horário já está reservado para esta sala."
            )
        return data


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "user_name",
            "action",
            "entity",
            "entity_id",
            "description",
            "created_at",
        ]

    def get_user_name(self, obj):
        if not obj.user:
            return "Sistema"
        return obj.user.first_name or obj.user.username

    def get_description(self, obj):
        entity_labels = {
            "user": "usuário",
            "room": "sala",
            "reservation": "reserva",
        }
        entity_label = entity_labels.get(obj.entity, obj.entity)

        descriptions = {
            "REGISTER": "Novo usuário registrado no sistema",
            "LOGIN_SUCCESS": "Login realizado com sucesso",
            "LOGIN_FAILED": "Tentativa de login com credenciais inválidas",
            "LOGIN_LOCKED": "Conta bloqueada por tentativas excessivas",
            "CREATE": f"Criou {entity_label} #{obj.entity_id}",
            "UPDATE": f"Atualizou {entity_label} #{obj.entity_id}",
            "DELETE": f"Removeu {entity_label} #{obj.entity_id}",
            "CANCEL": f"Cancelou {entity_label} #{obj.entity_id}",
        }

        return descriptions.get(obj.action, f"{obj.action} em {entity_label}")
