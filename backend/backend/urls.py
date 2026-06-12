from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.auth_views import LoginView, RegisterView
from api.dashboard_views import DashboardStatsView
from api.views import AuditLogViewSet, PublicKeyView, RoomViewSet, ReservationViewSet

router = DefaultRouter()
router.register(r"salas", RoomViewSet)
router.register(r"reservas", ReservationViewSet)
router.register(r"logs", AuditLogViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/dashboard/stats/", DashboardStatsView.as_view()),
    path("api/crypto/public-key/", PublicKeyView.as_view()),
    path("api/", include(router.urls)),
]