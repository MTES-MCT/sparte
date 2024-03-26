from rest_framework import serializers

from .models import CrispWebhookNotification


class CrispWebhookNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrispWebhookNotification
        fields = "__all__"
        read_only_fields = ("id",)
