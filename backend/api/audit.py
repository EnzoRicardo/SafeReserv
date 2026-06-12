from .models import AuditLog


def log_audit(user, action, entity, entity_id=None):
    AuditLog.objects.create(
        user=user,
        action=action,
        entity=entity,
        entity_id=entity_id,
    )
