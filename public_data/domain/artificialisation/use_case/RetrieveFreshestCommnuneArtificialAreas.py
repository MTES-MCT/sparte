from django.db.models.query import QuerySet

from public_data.models.administration import Commune
from public_data.models.ocsge import ArtificialArea, ZoneArtificielle

from .CalculateCommuneArtificialAreas import CalculateCommuneArtificialAreas


class RetrieveFreshestCommuneArtificialAreas:
    @staticmethod
    def execute(commune: Commune) -> QuerySet[ArtificialArea]:
        """
        This method retrieves the freshest artificial area objects of a commune by either :
        - calculating them if they don't exist
        - retrieving them if they exist and are the freshest
        - recalculating them if they exist but are outdated
        """
        artif_areas = ArtificialArea.objects.filter(city=commune.official_id)

        if not artif_areas.exists():
            return CalculateCommuneArtificialAreas.execute(commune)

        freshest_artif_area = artif_areas.latest("year")

        latest_zone_artificielle = ZoneArtificielle.objects.filter(departement=commune.departement.source_id).latest(
            "year"
        )

        if freshest_artif_area.year < latest_zone_artificielle.year:
            return CalculateCommuneArtificialAreas.execute(commune)

        return artif_areas
