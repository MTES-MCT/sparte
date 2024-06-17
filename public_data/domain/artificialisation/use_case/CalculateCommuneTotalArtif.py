from logging import getLogger

from public_data.models.administration import Commune
from public_data.models.ocsge import ArtificialArea

logger = getLogger(__name__)


class CalculateCommuneTotalArtif:
    @staticmethod
    def execute(commune: Commune) -> Commune:
        artif_areas = ArtificialArea.objects.filter(city=commune.insee)

        if artif_areas.exists():
            commune.surface_artif = artif_areas.latest("year").surface
        else:
            commune.surface_artif = None

        commune.save()

        return commune
