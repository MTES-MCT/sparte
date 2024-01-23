from functools import cache
from typing import Self

from django.contrib.gis.db.models.functions import Area, Transform
from django.core.management.base import BaseCommand
from django.db.models import DecimalField, Q
from django.db.models.functions import Cast

from public_data.models import (
    CouvertureUsageMatrix,
    DataSource,
    Departement,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)
from public_data.models.mixins import AutoLoadMixin


@cache
def get_matrix():
    return CouvertureUsageMatrix.matrix_dict()


class AutoOcsgeDiff(AutoLoadMixin, OcsgeDiff):
    class Meta:
        proxy = True

    @classmethod
    @property
    def mapping(cls) -> dict[str, str]:
        return {
            "cs_old": f"CS_{cls._year_old}",
            "us_old": f"US_{cls._year_old}",
            "cs_new": f"CS_{cls._year_new}",
            "us_new": f"US_{cls._year_new}",
            "mpoly": "MULTIPOLYGON",
        }

    def before_save(self) -> None:
        self.year_new = self.__class__._year_new
        self.year_old = self.__class__._year_old
        self.departement = self.__class__._departement

        self.new_matrix = get_matrix()[(self.cs_new, self.us_new)]
        self.new_is_artif = bool(self.new_matrix.is_artificial)

        if self.new_matrix.couverture:
            self.cs_new_label = self.new_matrix.couverture.label

        if self.new_matrix.usage:
            self.us_new_label = self.new_matrix.usage.label

        self.old_matrix = get_matrix()[(self.cs_old, self.us_old)]
        self.old_is_artif = bool(self.old_matrix.is_artificial)

        if self.old_matrix.couverture:
            self.cs_old_label = self.old_matrix.couverture.label
        if self.old_matrix.usage:
            self.us_old_label = self.old_matrix.usage.label

        self.is_new_artif = not self.old_is_artif and self.new_is_artif
        self.is_new_natural = self.old_is_artif and not self.new_is_artif

    @classmethod
    def calculate_fields(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).delete()


class AutoOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs) -> Self:
        self.year = self.__class__._year
        self.departement = self.__class__._departement
        key = (self.couverture, self.usage)

        self.matrix = get_matrix()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()

    @classmethod
    def calculate_fields(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class AutoZoneConstruite(AutoLoadMixin, ZoneConstruite):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs) -> Self:
        self.year = int(self._year)
        self.surface = self.mpoly.transform(2154, clone=True).area
        self.departement = self._departement
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()


def get_layer_mapper_proxy_class(source: DataSource):
    departement = Departement.objects.get(source_id=source.official_land_id)

    properties = {
        "Meta": type("Meta", (), {"proxy": True}),
        "shape_file_path": source.path,
        "_departement": departement,
        "__module__": __name__,
    }

    base_class = None

    if source.mapping:
        properties.update({"mapping": source.mapping})

    if source.name == DataSource.DataNameChoices.DIFFERENCE:
        base_class = AutoOcsgeDiff
        properties.update(
            {
                "_year_old": min(source.millesimes),
                "_year_new": max(source.millesimes),
            }
        )
    elif source.name == DataSource.DataNameChoices.OCCUPATION_DU_SOL:
        properties.update({"_year": source.millesimes[0]})
        base_class = AutoOcsge
    elif source.name == DataSource.DataNameChoices.ZONE_CONSTRUITE:
        properties.update({"_year": source.millesimes[0]})
        base_class = AutoZoneConstruite

    class_name = f"Auto{source.name}{departement}{'_'.join(map(str, source.millesimes))}"

    return type(class_name, (base_class,), properties)


class Command(BaseCommand):
    def get_queryset(self):
        return DataSource.objects.filter(
            productor=DataSource.ProductorChoices.IGN,
            dataset=DataSource.DatasetChoices.OCSGE,
        )

    def add_arguments(self, parser):
        parser.add_argument(
            "--departement",
            type=str,
            help="Departement name",
        )
        parser.add_argument(
            "--year-range",
            type=str,
            help="Year range",
        )
        parser.add_argument(
            "--layer-type",
            type=str,
            help="Layer type.",
        )
        parser.add_argument(
            "--all",
            action="store_true",
            help="Load all data",
        )

        parser.add_argument(
            "--list",
            action="store_true",
            help="List available data",
        )

    def handle(self, *args, **options):
        if not options:
            raise ValueError("You must provide at least one option, or use --all to load all data")

        if options.get("list"):
            for source in self.get_queryset():
                print(source)
            return

        sources = self.get_queryset()

        if options.get("departement"):
            departement_param = options.get("departement")
            departement_queryset = Departement.objects.filter(
                Q(source_id=departement_param) | Q(name__icontains=departement_param)
            )

            if not departement_queryset:
                raise ValueError(f"{departement_param} is not a valid departement")

            departement = departement_queryset.first()

            sources = sources.filter(official_land_id=departement.source_id)

        if options.get("year-range"):
            year_range = options.get("year-range").split(",")
            sources = sources.filter(millesimes__overlap=year_range)

        if options.get("layer-type"):
            sources = sources.filter(name__icontains=options.get("layer-type"))

        if not sources:
            raise ValueError("No data sources found")

        for source in sources:
            layer_mapper_proxy_class = get_layer_mapper_proxy_class(source)
            layer_mapper_proxy_class.load()
