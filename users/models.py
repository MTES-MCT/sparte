from typing import List

from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    class ORGANISMS(models.TextChoices):
        AGENCE_URBA = "AGENCE", "Agence d'urbanisme"
        AMENAGEUR = "AMENAG", "Aménageur"
        ASSOCIATION = "ASSOCI", "Association"
        BUREAU_ETUDE = "BUREAU", "Bureau d'études"
        COMMUNE = "COMMUN", "Commune"
        DDT = "DDT", "DDT"
        DEPARTEMENT = "DEPART", "Département"
        DREAL = "DREAL", "DREAL"
        EPCI = "EPCI", "EPCI"
        EPF = "EPF", "EPF"
        GIP = "GIP", "GIP"
        PARTICULIER = "PARTIC", "Particulier"
        REGION = "REGION", "Région"
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

    objects = UserManager()

    @staticmethod
    def get_group(organism):
        if organism in [
            User.ORGANISMS.COMMUNE,
            User.ORGANISMS.EPCI,
            User.ORGANISMS.SCOT,
            User.ORGANISMS.DEPARTEMENT,
            User.ORGANISMS.REGION,
        ]:
            return "Collectivités"
        elif organism in [User.ORGANISMS.AGENCE_URBA, User.ORGANISMS.BUREAU_ETUDE]:
            return "Bureaux d'études"
        elif organism in [User.ORGANISMS.DDT, User.ORGANISMS.DREAL]:
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

    def save(self, *args, **kwargs):
        self.organism_group = User.get_group(self.organism)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Utilisateur"
        ordering = ["email"]
