from django.contrib import admin
from .models import User, Room, Reservation, AuditLog

# O User customizado costuma precisar de um registro um pouco diferente 
# se você quiser ver a troca de senhas bonitinha, mas o básico é assim:
admin.site.register(User)
admin.site.register(Room)
admin.site.register(Reservation)
admin.site.register(AuditLog)