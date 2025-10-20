from project.charts.constants import LEGEND_NAVIGATION_EXPORT, OCSGE_CREDITS
from public_data.models.impermeabilisation import (
    LandImperFluxCouvertureComposition,
    LandImperFluxCouvertureCompositionIndex,
)

from .ImperFluxByUsage import ImperFluxByUsage


class ImperFluxByCouverture(ImperFluxByUsage):
    name = "Imperméabilisation"
    sol = "couverture"
    model = LandImperFluxCouvertureCompositionIndex
    model_by_departement = LandImperFluxCouvertureComposition


class ImperFluxByCouvertureExport(ImperFluxByCouverture):
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
