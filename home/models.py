import string
import traceback
from random import choices

from django.db import models
from django.urls import reverse
from django.utils import timezone

from utils.functions import get_url_with_domain


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

    class Meta:
        verbose_name = "Formulaire de contact"
        verbose_name_plural = "Formulaires de contact"

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

    def __str__(self):
        return f"Formulaire de contact de {self.email}"


class Newsletter(models.Model):
    email = models.EmailField("Courriel")
    created_date = models.DateTimeField(auto_now_add=True)
    confirm_token = models.CharField(max_length=25, unique=True)
    confirmation_date = models.DateTimeField(null=True, blank=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.confirm_token:
            self.confirm_token = self.get_token()

    def get_token(self):
        alphabet = string.ascii_letters + string.digits + "-_"
        alphabet = alphabet.replace("'", "").replace("\\", "")
        return "".join(choices(alphabet, k=25))

    def get_confirmation_url(self):
        return get_url_with_domain(
            reverse("home:nwl-confirmation", kwargs={"token": self.confirm_token})
        )

    def confirm(self):
        self.confirmation_date = timezone.now()
        self.save()

    def __str__(self):
        return f"Newsletter de {self.email}"
