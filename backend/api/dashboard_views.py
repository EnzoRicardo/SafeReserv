from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditLog, Reservation, Room
from .permissions import IsAdminRole


class DashboardStatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        today = timezone.localdate()
        reservations = Reservation.objects.select_related("user", "room").order_by(
            "-created_at"
        )[:5]

        recent_reservations = [
            {
                "user": item.user.first_name or item.user.username,
                "room": item.room.name,
                "date": item.reservation_date.strftime("%d/%m/%Y"),
                "time": (
                    f"{item.start_time.strftime('%H:%M')} - "
                    f"{item.end_time.strftime('%H:%M')}"
                ),
                "status": item.status,
            }
            for item in reservations
        ]

        return Response(
            {
                "rooms_count": Room.objects.count(),
                "active_reservations": Reservation.objects.filter(
                    status="approved"
                ).count(),
                "pending_reservations": Reservation.objects.filter(
                    status="pending"
                ).count(),
                "logs_today": AuditLog.objects.filter(
                    created_at__date=today
                ).count(),
                "recent_reservations": recent_reservations,
            }
        )
