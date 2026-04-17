from django.db import models
from django.contrib.auth.models import AbstractUser


# 1. Tabela USERS (Aproveitando o Django)
class User(AbstractUser):
    # O Django já inclui id, password, email, first_name, last_name, is_active, etc.
    # Adicionamos apenas os seus campos customizados:
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)


# 2. Tabela ROOMS
class Room(models.Model):
    # O id (SERIAL PRIMARY KEY) é criado automaticamente pelo Django!

    ROOM_TYPES = [
        ('study', 'Study'),
        ('group', 'Group'),
        ('meeting', 'Meeting'),
        ('teacher', 'Teacher'),
    ]
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('maintenance', 'Maintenance'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=30, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    capacity = models.PositiveIntegerField()  # Já garante que seja > 0
    location = models.CharField(max_length=150, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# 3. Tabela RESERVATIONS
class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    # As chaves estrangeiras (FOREIGN KEY)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    reservation_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    participants_count = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)


# 4. Tabela AUDIT_LOGS
class AuditLog(models.Model):
    # null=True, blank=True permite que o log seja do sistema (sem usuário associado)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    entity = models.CharField(max_length=50)
    entity_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)