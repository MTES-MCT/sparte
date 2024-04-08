from rest_framework.mixins import CreateModelMixin
from rest_framework.viewsets import GenericViewSet

from .models import CrispWebhookNotification
from .permissions import HasCrispValidKey
from .serializers import CrispWebhookNotificationSerializer


class CrispWebhookNotificationView(GenericViewSet, CreateModelMixin):
    queryset = CrispWebhookNotification.objects.all()
    serializer_class = CrispWebhookNotificationSerializer
    permission_classes = [HasCrispValidKey]
