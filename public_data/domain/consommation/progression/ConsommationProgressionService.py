from public_data.domain.consommation.progression.ConsommationProgression import (
    AnnualConsommation,
    ConsommationProgressionAggregation,
    ConsommationProgressionLand,
)
from public_data.models import Land, LandConso


class ConsommationProgressionService:
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> ConsommationProgressionAggregation:
        conso = LandConso.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            year__gte=start_date,
            year__lte=end_date,
        ).order_by("year")
        return ConsommationProgressionAggregation(
            start_date=start_date,
            end_date=end_date,
            consommation=[
                AnnualConsommation(
                    year=c.year,
                    habitat=c.habitat,
                    activite=c.activite,
                    mixte=c.mixte,
                    route=c.route,
                    ferre=c.ferroviaire,
                    non_reseigne=c.inconnu,
                    total=c.total,
                    per_mille_of_area=c.total / land.area * 1000,
                )
                for c in conso
            ],
        )

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
                    consommation=self.get_by_land(
                        land=land,
                        start_date=start_date,
                        end_date=end_date,
                    ).consommation,
                )
            )

        return output
