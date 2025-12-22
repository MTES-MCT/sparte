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
        return f"{super().title_end} sur le territoire de {self.land.name} (en ha)"

    @property
    def categories(self):
        """Version export: affiche uniquement le code (usage ou couverture)"""
        return [getattr(item, self.sol) for item in self.data]

    @property
    def series(self):
        base_series = super().series
        if not base_series:
            return None

        # Ajouter les dataLabels avec la couleur de la série
        for serie in base_series:
            serie["dataLabels"] = {
                "enabled": True,
                "format": "{point.y:,.2f}",
                "allowOverlap": True,
                "style": {
                    "textOutline": "none",
                    "color": serie["color"],
                },
            }
        return base_series

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bar", "height": 800},
            "credits": OCSGE_CREDITS,
            "title": {"text": self.title},
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "plotOptions": {
                "bar": {
                    "groupPadding": 0.2,
                    "borderWidth": 0,
                }
            },
        }
