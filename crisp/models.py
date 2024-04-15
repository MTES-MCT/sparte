from django.db import models

from .signals import on_notification_save


class CrispWebhookNotification(models.Model):
    event = models.CharField(max_length=255)
    timestamp = models.DateTimeField()
    data = models.JSONField()

    @property
    def origin(self):
        return self.data.get("origin", "crisp")

    @property
    def message(self):
        return self.data.get("content")

    @property
    def inbox_url(self):
        if "message" in self.event:
            website_id = self.data.get("website_id")
            session_id = self.data.get("session_id")
            if not website_id or not session_id:
                return None
            return f"https://app.crisp.chat/website/{website_id}/inbox/{session_id}/"

        return None

    def __str__(self) -> str:
        return f"{self.event} - {self.timestamp}"


models.signals.post_save.connect(on_notification_save, sender=CrispWebhookNotification)
