from django.db.models import Sum
from django.db.models.query import QuerySet

from public_data.domain.ClassCacher import ClassCacher
from public_data.models import Cerema, Commune, Land

from .ConsommationProgression import (
    AnnualConsommation,
    ConsommationProgressionAggregation,
    ConsommationProgressionLand,
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
        communes_key = "-".join(communes.values_list("insee", flat=True))
        key = f"{start_date}-{end_date}-{communes_key}"

        if self.class_cacher.exists(key):
            return self.class_cacher.get(key)

        surface_field = "surfcom23"

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
        determinants_fields = [
            f"art{year[-2:]}{det}{str(int(year) + 1)[-2:]}"
            for year in years
            for det in determinants
        ]

        fields = artif_fields + determinants_fields + [surface_field]

        qs = Cerema.objects.filter(city_insee__in=communes.values("insee"))
        args = {field: Sum(field) for field in fields}
        qs = qs.aggregate(**args)

        results = {}
        surface = qs[surface_field]

        for key, val in qs.items():
            if key == surface_field:
                continue
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

        progression.consommation = [
            AnnualConsommation(
                year=year,
                total=results[year]["total"] / 10000,
                habitat=results[year]["hab"] / 10000,
                activite=results[year]["act"] / 10000,
                mixte=results[year]["mix"] / 10000,
                route=results[year]["rou"] / 10000,
                ferre=results[year]["fer"] / 10000,
                non_reseigne=results[year]["inc"] / 10000,
                per_mille_of_area=results[year]["total"] / surface * 1000,
            )
            for year in results
        ]

        self.class_cacher.set(key, value=progression)

        return progression

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationProgressionLand]:
        if not lands:
            return []

        output = []

        for land in lands:
            output.append(
                ConsommationProgressionLand(
                    land=land,
                    start_date=start_date,
                    end_date=end_date,
                    consommation=self.get_by_communes_aggregation(
                        communes=land.get_cities_queryset(),
                        start_date=start_date,
                        end_date=end_date,
                    ).consommation,
                )
            )

        return output
