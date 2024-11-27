from public_data.domain.consommation.entity import (
    AnnualConsommation,
    ConsommationProgressionCollectionLand,
)
from public_data.models import Land, LandConso


class ConsommationProgressionService:
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> ConsommationProgressionCollectionLand:
        conso = LandConso.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            year__gte=start_date,
            year__lte=end_date,
        ).order_by("year")
        return ConsommationProgressionCollectionLand(
            start_date=start_date,
            end_date=end_date,
            land=land,
            consommation=[
                AnnualConsommation(
                    year=c.year,
                    habitat=c.habitat / 10000,
                    activite=c.activite / 10000,
                    mixte=c.mixte / 10000,
                    route=c.route / 10000,
                    ferre=c.ferroviaire / 10000,
                    non_reseigne=c.inconnu / 10000,
                    total=c.total / 10000,
                    per_mille_of_area=c.total / 10000 / land.area * 1000,
                )
                for c in conso
            ],
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationProgressionCollectionLand]:
        output = []

        for land in lands:
            output.append(
                ConsommationProgressionCollectionLand(
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
