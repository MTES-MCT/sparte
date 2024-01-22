from django.contrib.postgres.fields import ArrayField
from django.db import models


class DataSource(models.Model):
    class Meta:
        unique_together = ["productor", "dataset", "name", "millesimes", "official_land_id"]
        ordering = ["official_land_id", "millesimes", "name"]

    class ProductorChoices(models.TextChoices):
        IGN = "IGN", "Institut national de l'information géographique et forestière"

    class DatasetChoices(models.TextChoices):
        OCSGE = "OCSGE", "Occupation du sol à grande échelle"

    class DataNameChoices(models.TextChoices):
        OCCUPATION_DU_SOL = "OCCUPATION_DU_SOL", "Couverture et usage du sol"
        DIFFERENCE = "DIFFERENCE", "Différence entre deux OCSGE"
        ZONE_CONSTRUITE = "ZONE_CONSTRUITE", "Zone construite"

    productor = models.CharField("Producteur", max_length=255, choices=ProductorChoices.choices)
    dataset = models.CharField("Jeu de donnée", max_length=255, choices=DatasetChoices.choices)
    name = models.CharField(
        "Nom",
        max_length=255,
        choices=DataNameChoices.choices,
        help_text="Nom de la couche de données au sein du jeu de donnée",
    )
    millesimes = ArrayField(
        models.IntegerField(),
        verbose_name="Année(s)",
        blank=True,
        null=True,
        help_text="Séparer les années par une virgule si la donnée concerne plusieurs années",
    )
    mapping = models.JSONField(
        blank=True, null=True, help_text="A renseigner uniquement si le mapping n'est pas standard."
    )
    path = models.CharField("Chemin sur S3", max_length=255)
    source_url = models.URLField(
        "URL de la source",
        blank=True,
        null=True,
        help_text="Cet URL peut-être le même pour plusieurs sources (par exemple, si contenu dans archive zip)",
    )
    official_land_id = models.CharField(
        verbose_name="ID du territoire",
        help_text="""
            ID officiel du territoire (code INSEE, SIREN, etc.) <br />
            Peut-être vide si la donnée ne concerne pas un territoire spécifique
            (par exemple, s'il concerne la France entière)
        """,
        max_length=255,
        blank=True,
        null=True,
    )

    def __str__(self) -> str:
        return f"{self.productor} - {self.dataset} - {self.official_land_id} - {self.name} - {self.millesimes}"
