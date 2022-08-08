import traceback
from django.db import models
from django.utils import timezone


class ContactForm(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = "PENDING", "Awaiting celery to process the task"
        SUCCESS = "SUCCESS", "Task done with success"
        FAILED = "FAILED", "Task failed"

    email = models.EmailField("Votre courriel")
    content = models.TextField("Votre message")

    status = models.CharField(
        max_length=10, choices=StatusChoices.choices, default=StatusChoices.PENDING
    )
    created_date = models.DateTimeField(auto_now_add=True)
    processed_date = models.DateTimeField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)

    def success(self):
        self.processed_date = timezone.now()
        self.status = self.StatusChoices.SUCCESS
        self.error = None
        self.save()

    def handle_exception(self):
        self.processed_date = timezone.now()
        self.status = self.StatusChoices.FAILED
        self.error = traceback.format_exc()
        self.save()


class Newsletter(models.Model):
    email = models.EmailField("Votre courriel")
    created_date = models.DateTimeField(auto_now_add=True)
    confirm_token = models.CharField(max_length=25)
    confirmation_date = models.DateTimeField(null=True, blank=True)
