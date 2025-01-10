from public_data.domain.urbanisme.logement_vacant.entity import (
    AnnualLogementVacant,
    LogementVacantCollection,
)
from public_data.domain.urbanisme.logement_vacant.progression import (
    BaseLogementVacantProgressionService,
)
from public_data.models import Land, LogementVacant


class LogementVacantProgressionService(BaseLogementVacantProgressionService):
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> LogementVacantCollection:
        data = LogementVacant.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            year__gte=start_date,
            year__lte=end_date,
        ).order_by("year")

        return LogementVacantCollection(
            land=land,
            start_date=start_date,
            end_date=end_date,
            logement_vacant=[
                AnnualLogementVacant(
                    year=item.year,
                    logements_parc_prive=item.logements_parc_prive,
                    logements_vacants_parc_prive=item.logements_vacants_parc_prive,
                    logements_parc_social=item.logements_parc_social,
                    logements_vacants_parc_social=item.logements_vacants_parc_social,
                    logements_vacants_parc_prive_percent=item.logements_vacants_parc_prive_percent,
                    logements_vacants_parc_social_percent=item.logements_vacants_parc_social_percent,
                )
                for item in data
            ],
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[LogementVacantCollection]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]
