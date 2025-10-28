from public_data.domain.consommation.entity import (
    AnnualConsommation,
    ConsommationCollection,
)
from public_data.domain.consommation.progression import (
    BaseConsommationProgressionService,
)
from public_data.models import LandConso, LandConsoStats
from public_data.models.administration import LandModel


class ConsommationProgressionService(BaseConsommationProgressionService):
    def get_by_land(
        self,
        land: LandModel,
        start_date: int,
        end_date: int,
    ) -> ConsommationCollection:
        conso = LandConso.objects.filter(
            land_id=land.land_id,
            land_type=land.land_type,
            year__gte=start_date,
            year__lte=end_date,
        ).order_by("year")

        conso_stats = LandConsoStats.objects.get(
            land_id=land.land_id,
            land_type=land.land_type,
            from_year=start_date,
            to_year=end_date,
        )

        return ConsommationCollection(
            start_date=start_date,
            end_date=end_date,
            land=land,
            total_conso_over_period=conso_stats.total / 10000,
            consommation=[
                AnnualConsommation(
                    year=c.year,
                    habitat=c.habitat / 10000,
                    activite=c.activite / 10000,
                    mixte=c.mixte / 10000,
                    route=c.route / 10000,
                    ferre=c.ferroviaire / 10000,
                    non_renseigne=c.inconnu / 10000,
                    total=c.total / 10000,
                    total_percent_of_area=c.total / 10000 / land.surface * 100 if land.surface else 0,
                )
                for c in conso
            ],
        )

    def get_by_lands(
        self,
        lands: list[LandModel],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationCollection]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]
