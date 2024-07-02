from django.core.cache import cache
from django.db.models import Sum
from django.db.models.query import QuerySet

from public_data.domain.ClassCacher import ClassCacher
from public_data.infra.PickleClassCacher import PickleClassCacher
from public_data.models import Cerema, Commune

from .ConsommationProgression import (
    AnnualConsommation,
    ConsommationProgressionAggregation,
    ConsommationProgressionByCommune,
)


class ConsommationProgressionService:
    def __init__(self, class_cacher: ClassCacher):
        self.class_cacher = class_cacher

    def get_by_communes_aggregation(
        self,
        communes: QuerySet[Commune],
        start_date: int,
        end_date: int,
    ) -> ConsommationProgressionAggregation:
        artif_fields = Cerema.get_art_field(
            start=str(start_date),
            end=str(end_date),
        )
        determinants = [
            "hab",
            "act",
            "mix",
            "rou",
            "fer",
            "inc",
        ]
        years = [str(i) for i in range(start_date, end_date + 1)]
        determinants_fields = []

        for year in years:
            start = year[-2:]
            end = str(int(year) + 1)[-2:]
            for det in determinants:
                determinants_fields.append(f"art{start}{det}{end}")

        fields = artif_fields + determinants_fields

        qs = Cerema.objects.filter(city_insee__in=communes.values("insee"))
        args = {field: Sum(field) for field in fields}
        qs = qs.aggregate(**args)

        results = {}

        for key, val in qs.items():
            year = int(f"20{key[3:5]}")

            if year not in results:
                results[year] = {}

            if key in artif_fields:
                results[year]["total"] = val

            if key in determinants_fields:
                det = key[5:8]
                results[year][det] = val

        progression = ConsommationProgressionAggregation(
            start_date=start_date,
            end_date=end_date,
            consommation=[],
            communes_code_insee=[commune.insee for commune in communes],
        )

        for year in results:
            progression.consommation.append(
                AnnualConsommation(
                    year=year,
                    total=results[year]["total"] / 10000,
                    habitat=results[year]["hab"] / 10000,
                    activite=results[year]["act"] / 10000,
                    mixte=results[year]["mix"] / 10000,
                    route=results[year]["rou"] / 10000,
                    ferre=results[year]["fer"] / 10000,
                    non_reseigne=results[year]["inc"] / 10000,
                )
            )

        return progression

    def get_by_communes(
        self,
        communes: QuerySet[Commune],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationProgressionByCommune]:
        key = f"{start_date}-{end_date}-{communes.values_list('insee', flat=True)}"

        if self.class_cacher.exists(key):
            return self.class_cacher.get(key)

        output = []

        for commune in communes:
            output.append(
                ConsommationProgressionByCommune(
                    commune_code_insee=commune.insee,
                    start_date=start_date,
                    end_date=end_date,
                    consommation=self.get_by_communes_aggregation(
                        communes=Commune.objects.filter(insee=commune.insee),
                        start_date=start_date,
                        end_date=end_date,
                    ).consommation,
                )
            )

        self.class_cacher.set(key, output)

        return output


gers = Commune.objects.filter(insee__startswith="32")

service = ConsommationProgressionService(
    class_cacher=PickleClassCacher(cache=cache),
)

print(
    service.get_by_communes(
        communes=gers,
        start_date=2011,
        end_date=2022,
    )
)
