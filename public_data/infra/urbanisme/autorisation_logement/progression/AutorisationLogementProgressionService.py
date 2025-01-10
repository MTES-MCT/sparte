from public_data.domain.urbanisme.autorisation_logement.entity import (
    AnnualAutorisationLogement,
    AutorisationLogementCollection,
)
from public_data.domain.urbanisme.autorisation_logement.progression import (
    BaseAutorisationLogementProgressionService,
)
from public_data.models import AutorisationLogement, Land


class AutorisationLogementProgressionService(BaseAutorisationLogementProgressionService):
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> AutorisationLogementCollection:
        data = AutorisationLogement.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            year__gte=start_date,
            year__lte=end_date,
        ).order_by("year")

        return AutorisationLogementCollection(
            land=land,
            start_date=start_date,
            end_date=end_date,
            autorisation_logement=[
                AnnualAutorisationLogement(
                    year=item.year,
                    logements_autorises=item.logements_autorises,
                    percent_autorises_on_parc_general=item.percent_autorises_on_parc_general,
                )
                for item in data
            ],
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[AutorisationLogementCollection]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]
