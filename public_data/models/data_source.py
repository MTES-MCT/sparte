import re
from typing import Any, Callable, Dict

from django.contrib.postgres.fields import ArrayField
from django.db import models

from public_data.models import cerema, ocsge
from public_data.models.administration import Departement
from public_data.models.enums import SRID
from public_data.models.mixins import AutoLoadMixin


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

    def get_class_properties(self, module_name: str) -> Dict[str, Any]:
        properties = {
            "Meta": type("Meta", (), {"proxy": True}),
            "shape_file_path": self.path,
            "departement_id": self.official_land_id,
            "srid": self.srid,
            "__module__": module_name,
        }
        if self.mapping:
            properties["mapping"] = self.mapping
        properties |= self.get_properties_for_ocsge()
        return properties

    def get_properties_for_ocsge(self) -> Dict[str, int]:
        properties = {}
        if self.name in [
            DataSource.DataNameChoices.DIFFERENCE,
            DataSource.DataNameChoices.OCCUPATION_DU_SOL,
            DataSource.DataNameChoices.ZONE_CONSTRUITE,
        ]:
            properties |= {"_departement": Departement.objects.get(source_id=self.official_land_id)}
            if self.name == DataSource.DataNameChoices.DIFFERENCE:
                properties |= {"_year_old": min(self.millesimes), "_year_new": max(self.millesimes)}
            else:
                properties |= {"_year": self.millesimes[0]}
        return properties

    def get_base_class(self) -> Callable:
        """Return the base class from which the proxy should inherit from.

        The base class depends on the data name.

        The base class returned should be a child of AutoLoadMixin.
        """
        base_class = None
        if self.name == DataSource.DataNameChoices.DIFFERENCE:
            base_class = ocsge.AutoOcsgeDiff
        elif self.name == DataSource.DataNameChoices.OCCUPATION_DU_SOL:
            base_class = ocsge.AutoOcsge
        elif self.name == DataSource.DataNameChoices.ZONE_CONSTRUITE:
            base_class = ocsge.AutoZoneConstruite
        elif self.name == DataSource.DataNameChoices.CONSOMMATION_ESPACE:
            if self.official_land_id == "MetropoleEtCorse":
                base_class = cerema.BaseLoadCerema
            else:
                base_class = cerema.BaseLoadCeremaDromCom
        if base_class is None:
            raise ValueError(f"Unknown base class for data name: {self.name}")
        if not issubclass(base_class, AutoLoadMixin):
            raise TypeError(f"Base class {base_class} should inherit from AutoLoadMixin.")
        return base_class

    def get_class_name(self) -> str:
        """Build a class name in KamelCase.

        Naming rule: Auto{data_name}{official_land_id}{year}
        Example: AutoOcsgeDiff3220182021
        """
        raw_words = ["Auto", self.name, self.official_land_id] + list(map(str, self.millesimes))
        splited_words = [sub_word for word in raw_words for sub_word in word.split("_")]
        cleaned_words = [re.sub(r"[^a-zA-Z0-9_]", "", word) for word in splited_words]
        class_name = "".join([word.capitalize() for word in cleaned_words if word])
        return class_name

    def get_layer_mapper_proxy_class(self, module_name: str = __name__) -> Callable:
        return type(
            self.get_class_name(),
            (self.get_base_class(),),
            self.get_class_properties(module_name),
        )
