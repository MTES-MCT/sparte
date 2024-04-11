from django.contrib.gis.db import models


class DocumentUrbanismeChoices(models.TextChoices):
    CC = "CC", "Carte communale"
    POS = "POS", "Plan d'occupation des sols"
    PLU = "PLU", "Plan local d'urbanisme"
    RNU = "RNU", "Règlement national d'urbanisme"
    PLUi = "PLUi", "Plan local d'urbanisme intercommunal"
    PLUiS = "PLUiS", "Plan local d'urbanisme intercommunal simplifié"


class Sudocuh(models.Model):
    code_insee = models.CharField(max_length=200, primary_key=True)
    code_departement = models.CharField(max_length=200)
    nom_region = models.CharField(max_length=200)
    nom_commune = models.CharField(max_length=200)
    collectivite_porteuse = models.CharField(
        "Collectivité porteuse", max_length=200, help_text="Nom de la collectivité qui a la compétence PLU (DU)"
    )
    siren_epci = models.CharField(
        "SIREN EPCI",
        max_length=200,
        help_text="Indiqué lorsque la collectivité porteuse est de type EPCI",
        blank=True,
        null=True,
    )
    code_etat = models.CharField(
        "Code état",
        max_length=2,
        help_text=(
            "Sur 2 caracteres, le premier codifie le document opposable "
            "(1-CC, 2-POS, 3-PLU, 9-RNU), "
            "le 2e caractere codifie le type de DU de la procédure en cours "
            "(1-CC, 3-PLU, 9- Aucune procédure en cours)"
        ),
    )
    du_opposable = models.CharField(
        "Document d'urbanisme opposable",
        max_length=200,
        help_text="DU opposable sur la commune (RNU, CC, POS, PLU, PLUi ou PLUiS)",
        choices=DocumentUrbanismeChoices.choices,
        blank=True,
        null=True,
    )
    du_en_cours = models.CharField(
        "Document d'urbanisme en cours",
        max_length=200,
        help_text="DU en cours sur la commune (Aucun, CC, PLU, PLUi ou PLUiS)",
        choices=DocumentUrbanismeChoices.choices,
        blank=True,
        null=True,
    )
    code_bcsi = models.CharField(max_length=200)
    etat_commune = models.CharField(max_length=200)
    etat_detaille = models.CharField(max_length=200)

    prescription_du_en_vigueur = models.DateField("Prescription du DU en vigueur", blank=True, null=True)
    approbation_du_en_vigueur = models.DateField("Approbation du DU en vigueur", blank=True, null=True)
    executoire_du_en_vigueur = models.DateField("Executoire du DU en vigueur", blank=True, null=True)
    prescription_proc_en_cours = models.DateField("Prescription de la procédure en cours", blank=True, null=True)
    population_municipale = models.IntegerField()
    population_totale = models.IntegerField()
    superficie = models.FloatField(
        "Superficie (en ha)",
    )
