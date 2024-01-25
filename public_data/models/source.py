from typing import Callable, Tuple

from django.contrib.postgres.fields import ArrayField
from django.db import models

from public_data.models.enums import SRID


class DataSource(models.Model):
    class Meta:
        unique_together = ["productor", "dataset", "name", "millesimes", "official_land_id"]
        ordering = ["official_land_id", "millesimes", "name"]

    class ProductorChoices(models.TextChoices):
        IGN = "IGN", "Institut national de l'information géographique et forestière"
        CEREMA = (
            "CEREMA",
            "Centre d'études et d'expertise sur les risques, l'environnement, la mobilité et l'aménagement",
        )

    class DatasetChoices(models.TextChoices):
        OCSGE = "OCSGE", "Occupation du sol à grande échelle"
        MAJIC = "MAJIC", "Mise A Jour des Informations Cadastrales"

    class DataNameChoices(models.TextChoices):
        OCCUPATION_DU_SOL = "OCCUPATION_DU_SOL", "Couverture et usage du sol"
        DIFFERENCE = "DIFFERENCE", "Différence entre deux OCSGE"
        ZONE_CONSTRUITE = "ZONE_CONSTRUITE", "Zone construite"
        CONSOMMATION_ESPACE = "CONSOMMATION_ESPACE", "Consommation d'espace"

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
        verbose_name="Millésime(s)",
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
            (par exemple, s'il concerne la France entière, ou un DROM-COM entier)
        """,
        max_length=255,
    )
    srid = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    def __str__(self) -> str:
        return f"{self.productor} - {self.dataset} - {self.official_land_id} - {self.name} - {self.millesimes}"

    def get_layer_mapper_proxy_class(
        self, module_name: str = "Not set", base_classes: Tuple[Callable] | None = None
    ) -> Callable:
        properties = {
            "Meta": type("Meta", (), {"proxy": True}),
            "shape_file_path": self.path,
            "departement_id": self.official_land_id,
            "srid": self.srid,
            "__module__": module_name,
        }

        if self.mapping:
            properties["mapping"] = self.mapping

        class_name = f"Auto{self.name}{self.official_land_id}{'_'.join(map(str, self.millesimes))}"

        if base_classes is None:
            base_classes = ()

        return type(class_name, base_classes, properties)
