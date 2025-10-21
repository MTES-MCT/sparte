from project.charts.constants import LEGEND_NAVIGATION_EXPORT, OCSGE_CREDITS
from public_data.models.artificialisation import (
    LandArtifFluxCouvertureComposition,
    LandArtifFluxCouvertureCompositionIndex,
)

from .ArtifFluxByUsage import ArtifFluxByUsage


class ArtifFluxByCouverture(ArtifFluxByUsage):
    name = "Artificialisation"
    sol = "couverture"
    model = LandArtifFluxCouvertureCompositionIndex
    model_by_departement = LandArtifFluxCouvertureComposition


class ArtifFluxByCouvertureExport(ArtifFluxByCouverture):
    @property
    def title_end(self):
        return f" sur le territoire de {self.land.name}"

    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {"text": self.title},
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
        }
