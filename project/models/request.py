from django.conf import settings
from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords

from project.models import Project
from users.models import User
from utils.validators import is_alpha_validator


def upload_in_project_folder(request: "Request", filename: str) -> str:
    return f"diagnostics/{request.project.get_folder_name()}/{filename}"


class RequestedDocumentChoices(models.TextChoices):
    RAPPORT_CONSO = "rapport-conso", "Rapport de consommation"
    RAPPORT_COMPLET = "rapport-complet", "Rapport complet"
    RAPPORT_LOCAL = "rapport-local", "Rapport local"


class Request(models.Model):
    first_name = models.CharField("Prénom", max_length=150, validators=[is_alpha_validator], null=True)
    last_name = models.CharField("Nom", max_length=150, validators=[is_alpha_validator], null=True)
    function = models.CharField("Fonction", max_length=250, validators=[is_alpha_validator], null=True)
    organism = models.CharField(
        "Organisme",
        max_length=30,
        choices=User.ORGANISM.choices,
        validators=[is_alpha_validator],
    )
    email = models.EmailField("E-mail")
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, verbose_name="Projet", blank=True, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        verbose_name="demandeur",
        blank=True,
        null=True,
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    sent_date = models.DateTimeField("date d'envoi", null=True, blank=True)
    done = models.BooleanField("A été envoyé ?", default=False)
    requested_document = models.CharField(
        "Document demandé", max_length=30, choices=RequestedDocumentChoices.choices, validators=[is_alpha_validator]
    )
    sent_file = models.FileField(upload_to=upload_in_project_folder, null=True, blank=True)
    history = HistoricalRecords()
    du_en_cours = models.BooleanField(
        "Le document d'urbanisme du territoire est-il en cours de revision (au moment de la demande)",
        default=False,
    )
    competence_urba = models.BooleanField(
        "Le territoire a-t-il la compétence urbanisme (au moment de la demande)",
        default=False,
    )

    def sent(self):
        self.done = True
        self.sent_date = timezone.now()
        self.save(update_fields=["done", "sent_date"])

    def record_exception(self, exc):
        import traceback

        stack = traceback.format_exception(type(exc), exc, exc.__traceback__)
        self.errors.create(exception="\n".join(stack))

    class Meta:
        ordering = ["-created_date"]
        verbose_name = "Demande d'un diagnostic"
        verbose_name_plural = "Demandes de diagnostics"

    def __str__(self):
        return f"Demande de {self.first_name}"


class ErrorTracking(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="errors")
    created_date = models.DateTimeField(auto_now_add=True)
    exception = models.TextField()

    def __str__(self):
        lines = [_.strip() for _ in self.exception.splitlines() if _.strip()]
        try:
            last_line = lines.pop()
        except IndexError:
            last_line = "unknow"
        return f"{self.created_date:%Y%m%d %H%M%S}: {last_line}"

    class Meta:
        ordering = ["-created_date"]
