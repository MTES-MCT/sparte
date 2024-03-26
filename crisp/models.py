from django.db import models

from .signals import on_notification_save


class CrispWebhookNotification(models.Model):
    event = models.CharField(max_length=255)
    timestamp = models.DateTimeField()
    data = models.JSONField()

    @property
    def message(self):
        return self.data.get("content")

    def __str__(self) -> str:
        return f"{self.event} - {self.timestamp}"


models.signals.post_save.connect(on_notification_save, sender=CrispWebhookNotification)
