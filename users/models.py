from typing import List

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractUser):
    class ORGANISMS(models.TextChoices):
        AGENCE_URBA = "AGENCE", "Agence d'urbanisme"
        ASSOCIATION = "ASSOCI", "Association"
        BUREAU_ETUDE = "BUREAU", "Bureau d'études"
        COMMUNE = "COMMUN", "Commune"
        DDT = "DDT", "DDT"
        DDTM = "DDTM", "DDTM"
        DEAL = "DEAL", "DEAL"
        DREAL = "DREAL", "DREAL"
        DRIEAT = "DRIEAT", "DRIEAT"
        EPCI = "EPCI", "EPCI"
        PARTICULIER = "PARTIC", "Particulier"
        SCOT = "SCOT", "SCOT"
        AUTRE = "AUTRE", "Autre"

    username = None
    first_name = models.CharField("Prénom", max_length=150, blank=True)
    last_name = models.CharField("Nom", max_length=150, blank=True)
    email = models.EmailField("E-mail", unique=True)
    email_checked = models.DateTimeField("E-mail vérifie", blank=True, null=True)
    organism = models.CharField(
        "Organisme",
        max_length=250,
        choices=ORGANISMS.choices,
        default=ORGANISMS.COMMUNE,
    )
    organism_group = models.CharField("Groupe d'organisme", max_length=250, blank=True, null=True)
    function = models.CharField("Fonction", max_length=250)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: List[str] = []

    created_at = models.DateTimeField("Créé le", auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField("Mis à jour le", auto_now=True, blank=True, null=True)

    objects = UserManager()

    @staticmethod
    def get_group(organism):
        if organism in [
            User.ORGANISMS.COMMUNE,
            User.ORGANISMS.EPCI,
            User.ORGANISMS.SCOT,
        ]:
            return "Collectivités"
        elif organism in [User.ORGANISMS.AGENCE_URBA, User.ORGANISMS.BUREAU_ETUDE]:
            return "Bureaux d'études"
        elif organism in [
            User.ORGANISMS.DDT,
            User.ORGANISMS.DREAL,
            User.ORGANISMS.DDTM,
            User.ORGANISMS.DEAL,
            User.ORGANISMS.DRIEAT,
        ]:
            return "Services de l'Etat"
        elif organism in [User.ORGANISMS.ASSOCIATION, User.ORGANISMS.PARTICULIER]:
            return "Grand public"
        return "Non regroupé"

    @property
    def greetings(self):
        if self.first_name:
            return self.first_name
        return self.email

    def __str__(self):
        return self.email

    @property
    def created_today(self):
        if not self.created_at:
            return False
        return self.created_at.date() == timezone.now().date()

    def save(self, *args, **kwargs):
        self.organism_group = User.get_group(self.organism)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Utilisateur"
        ordering = ["email"]
