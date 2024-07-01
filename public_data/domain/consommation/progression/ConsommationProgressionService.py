from django.db.models import Sum
from django.db.models.query import QuerySet

from public_data.models import Cerema, Commune

from .ConsommationProgression import AnnualConsommation, ConsommationProgression


class ConsommationProgressionService:
    @staticmethod
    def get_by_communes(
        communes: QuerySet[Commune],
        start_date: int,
        end_date: int,
    ) -> ConsommationProgression:
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

        progression = ConsommationProgression(start_date=start_date, end_date=end_date, consommation=[])

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
