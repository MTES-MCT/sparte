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
    function = models.CharField("Fonction", max_length=250)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    @property
    def greetings(self):
        if self.first_name:
            return self.first_name
        return self.email

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = "Utilisateurs"
