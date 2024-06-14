from public_data.models import CommuneDiff, CommuneSol
from public_data.models.administration import Commune
from public_data.models.ocsge import ArtificialArea

from .CalculateCommuneArtificialAreas import CalculateCommuneArtificialAreas
from .CalculateCommuneDiff import CalculateCommuneDiff
from .CalculateCommuneTotalArtif import CalculateCommuneTotalArtif
from .CalculateCommuneUsageEtCouvertureRepartition import (
    CalculateCommuneUsageEtCouvertureRepartition,
)


class GetOrCalculateCommuneArtifData:
    @staticmethod
    def execute(commune: Commune):
        """
        This method retrieves the freshest artificial area objects of a commune by either :
        - calculating them if they don't exist
        - retrieving them if they exist and are the freshest
        - recalculating them if they exist but are outdated
        """
        artif_areas = ArtificialArea.objects.filter(city=commune.official_id)
        commune_sol = CommuneSol.objects.filter(city=commune)
        commune_diff = CommuneDiff.objects.filter(city=commune)

        if not artif_areas.exists():
            artif_areas = CalculateCommuneArtificialAreas.execute(commune)
            CalculateCommuneTotalArtif.execute(commune)

        if not commune_sol.exists():
            commune_sol = CalculateCommuneUsageEtCouvertureRepartition.execute(commune)

        if not commune_diff.exists():
            commune_diff = CalculateCommuneDiff.execute(commune)

        return {
            "artif_areas": artif_areas,
            "commune_sol": commune_sol,
            "commune_diff": commune_diff,
        }
