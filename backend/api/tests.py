from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .crypto_utils import (
    decrypt_sensitive_reservation_data,
    hybrid_decrypt,
    hybrid_encrypt,
)
from .models import Room, Reservation

User = get_user_model()


class HybridEncryptionTests(APITestCase):
    def test_roundtrip(self):
        plaintext = '{"participants_count": 5}'
        encrypted_data, wrapped_key = hybrid_encrypt(plaintext)
        decrypted = hybrid_decrypt(encrypted_data, wrapped_key)
        self.assertEqual(decrypted, plaintext)
        self.assertNotEqual(encrypted_data, plaintext)


class ReservationEncryptionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="aluno1",
            email="aluno@test.com",
            password="senha12345",
            role="student",
        )
        self.room = Room.objects.create(
            name="Sala A",
            code="A101",
            room_type="study",
            capacity=10,
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def _auth_headers(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_reservation_stores_encrypted_sensitive_data(self):
        payload = {
            "room": self.room.id,
            "reservation_date": "2026-12-01",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "participants_count": 7,
        }

        response = self.client.post(
            "/api/reservas/",
            payload,
            format="json",
            **self._auth_headers(),
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        reservation = Reservation.objects.get(id=response.data["id"])
        self.assertTrue(reservation.encrypted_details)
        self.assertTrue(reservation.wrapped_key)
        self.assertIsNone(reservation.participants_count)
        self.assertNotEqual(
            reservation.encrypted_details,
            '{"participants_count": 7}',
        )

        decrypted = decrypt_sensitive_reservation_data(
            reservation.encrypted_details,
            reservation.wrapped_key,
        )
        self.assertEqual(decrypted["participants_count"], 7)
        self.assertEqual(response.data["participants_count"], 7)


class AuthAndPermissionTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="aluno",
            email="aluno2@test.com",
            password="senha12345",
            role="student",
        )
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="senha12345",
            role="admin",
        )
        self.student_token = str(RefreshToken.for_user(self.student).access_token)
        self.admin_token = str(RefreshToken.for_user(self.admin).access_token)

    def test_protected_endpoint_rejects_without_token(self):
        response = self.client.get("/api/reservas/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_access_admin_dashboard(self):
        response = self.client.get(
            "/api/dashboard/stats/",
            HTTP_AUTHORIZATION=f"Bearer {self.student_token}",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_dashboard(self):
        response = self.client.get(
            "/api/dashboard/stats/",
            HTTP_AUTHORIZATION=f"Bearer {self.admin_token}",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
