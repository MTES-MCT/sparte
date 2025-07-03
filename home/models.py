import string
import traceback
from random import choices

from django.core import validators
from django.db import models
from django.urls import reverse
from django.utils import timezone

from users.models import User
from utils.functions import get_url_with_domain


class SatisfactionFormEntry(models.Model):
    user = models.ForeignKey(
        User,
        verbose_name="Utilisateur",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    nps = models.IntegerField(
        "Score NPS",
        help_text="A quel point êtes-vous succeptible de recommander ce service ? 0 étant peu probable et 10 très probable.",  # noqa: E501
        validators=[
            validators.MinValueValidator(0),
            validators.MaxValueValidator(10),
        ],
    )
    suggested_change = models.TextField(
        "Changement suggéré",
        help_text="Suggérez un changement ou une nouvelle fonctionnalité pour nous permettre d'améliorer le service.",
        blank=True,
        null=True,
    )
    recorded_date = models.DateTimeField(
        "Date d'enregistrement",
        auto_now_add=True,
        help_text="Date à laquelle le formulaire a été enregistré.",
    )


class ContactForm(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = "PENDING", "Awaiting celery to process the task"
        SUCCESS = "SUCCESS", "Task done with success"
        FAILED = "FAILED", "Task failed"

    email = models.EmailField("Votre courriel")
    content = models.TextField("Votre message")

    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.PENDING)
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
        return get_url_with_domain(reverse("home:nwl-validation", kwargs={"token": self.confirm_token}))

    def confirm(self):
        self.confirmation_date = timezone.now()
        self.save()

    def __str__(self):
        return f"Newsletter de {self.email}"


class AliveTimeStamp(models.Model):
    """Log a new instance every 15 minutes to check if async tasks are alive."""

    timestamp = models.DateTimeField(auto_now=True)
    queue_name = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.queue_name} - {self.timestamp:%Y-%m-%d %H:%M:%S}"

    class Meta:
        ordering = ["-timestamp"]
