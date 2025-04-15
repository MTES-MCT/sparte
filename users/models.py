from typing import List

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.constraints import UniqueConstraint
from django.db.models.functions import Lower
from django.utils import timezone

from public_data.models import AdminRef
from utils.validators import is_alpha_validator

from .managers import UserManager


class User(AbstractUser):
    class ORGANISM(models.TextChoices):
        COMMUNE = "COMMUNE", "Commune"
        EPCI = "EPCI", "EPCI"
        SCOT = "SCOT", "SCoT"
        SERVICES_REGIONAUX = "SERVICES_REGIONAUX", "DREAL / DRIEAT / DRIHL"
        SERVICES_DEPARTEMENTAUX = "SERVICES_DEPARTEMENTAUX", "DDT / DDTM / DEAL"
        EXPERTS_URBANISTES = "EXPERTS_URBANISTES", "Bureaux d'études / Agence d'urbanisme"
        ACTEURS_CITOYENS = "ACTEURS_CITOYENS", "Association / Particulier"

    class SERVICE(models.TextChoices):
        DELEGATION_TERRITORIALE = "DELEGATION_TERRITORIALE", "Délégation territoriale"
        MISSION_AMENAGEMENT = "MISSION_AMENAGEMENT", "Mission aménagement"
        MISSION_CONNAISSANCE = "MISSION_CONNAISSANCE", "Mission connaissance"
        MISSION_TRANSITION_ECOLOGIQUE = "MISSION_TRANSITION_ECOLOGIQUE", "Mission transition écologique"
        AUTRE = "AUTRE", "Autre"

    class FUNCTION(models.TextChoices):
        RESPONSABLE_URBANISME = "RESPONSABLE_URBANISME", "Chargé(e) ou responsable de mission urbanisme"
        RESPONSABLE_PLANIFICATION = "RESPONSABLE_PLANIFICATION", "Chargé(e) ou responsable de planification"
        RESPONSABLE_AMENAGEMENT = "RESPONSABLE_AMENAGEMENT", "Chargé(e) aménagement"
        SECRETAIRE_MAIRIE = "SECRETAIRE_MAIRIE", "Secrétaire de mairie (commune)"
        ELU = "ELU", "Élu(e)"
        AUTRE = "AUTRE", "Autre"

    username = None
    first_name = models.CharField("Prénom", max_length=150, validators=[is_alpha_validator])
    last_name = models.CharField("Nom", max_length=150, validators=[is_alpha_validator])
    email = models.EmailField("E-mail (Identifiant)", unique=True)
    email_checked = models.DateTimeField("E-mail vérifie", blank=True, null=True)
    organism = models.CharField(
        "Organisme",
        max_length=250,
        choices=ORGANISM.choices,
        blank=True,
        null=True,
    )
    service = models.CharField(
        "Service*",
        max_length=250,
        choices=SERVICE.choices,
        blank=True,
        null=True,
    )
    function = models.CharField(
        "Fonction*",
        max_length=250,
        choices=FUNCTION.choices,
        blank=True,
        null=True,
    )
    siret = models.CharField(
        "SIRET",
        max_length=250,
        blank=True,
        null=True,
    )
    main_land_type = models.CharField(
        "Type de territoire principal",
        choices=AdminRef.CHOICES,
        max_length=7,
        blank=True,
        null=True,
        help_text=(
            "Indique le niveau administratif du territoire principal de l'utilisateur. "
            "Cela va de la commune à la région."
        ),
    )
    main_land_id = models.CharField(
        "Identifiant du territoire principal",
        max_length=255,
        blank=True,
        null=True,
        help_text="Identifiant unique du territoire principal de l'utilisateur.",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: List[str] = []

    created_at = models.DateTimeField("Créé le", auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField("Mis à jour le", auto_now=True, blank=True, null=True)

    groups = models.ManyToManyField("auth.Group", related_name="users", blank=True)

    objects = UserManager()

    def clean(self):
        super().clean()

        # Validation pour le champ function
        if self.function and self.organism not in [
            self.ORGANISM.COMMUNE,
            self.ORGANISM.EPCI,
            self.ORGANISM.SCOT,
        ]:
            raise ValidationError(
                {
                    "function": (
                        "Le champ fonction ne peut être renseigné que pour les organismes "
                        "de type Commune, EPCI ou SCoT."
                    )
                }
            )

        # Validation pour le champ service
        if self.service and self.organism not in [
            self.ORGANISM.SERVICES_REGIONAUX,
            self.ORGANISM.SERVICES_DEPARTEMENTAUX,
        ]:
            raise ValidationError(
                {
                    "service": (
                        "Le champ service ne peut être renseigné que pour les organismes "
                        "de type Services régionaux ou Services départementaux."
                    )
                }
            )

    @property
    def is_profile_complete(self):
        """Vérifie si le profil de l'utilisateur est complet."""
        return bool(self.organism and self.main_land_id)

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
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Utilisateur"
        ordering = ["email"]
        constraints = [
            UniqueConstraint(
                Lower("email"),
                name="user_email_ci_uniqueness",
            ),
        ]
