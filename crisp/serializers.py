from datetime import datetime
from logging import getLogger

from rest_framework import serializers

from .models import CrispWebhookNotification

logger = getLogger(__name__)


class TimestampField(serializers.DateTimeField):
    def to_internal_value(self, value):
        converted = datetime.fromtimestamp(float("%s" % value) / 1000.0)
        return super(TimestampField, self).to_representation(converted)


class CrispWebhookNotificationSerializer(serializers.ModelSerializer):
    timestamp = TimestampField()

    class Meta:
        model = CrispWebhookNotification
        fields = "__all__"
        read_only_fields = ("id",)
