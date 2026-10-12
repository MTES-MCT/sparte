from public_data.models.impermeabilisation import (
    LandImperFluxCouvertureComposition,
    LandImperFluxCouvertureCompositionIndex,
)

from .ImperFluxByUsage import ImperFluxByUsage, ImperFluxByUsageExport


class ImperFluxByCouverture(ImperFluxByUsage):
    name = "Imperméabilisation"
    sol = "couverture"
    model = LandImperFluxCouvertureCompositionIndex
    model_by_departement = LandImperFluxCouvertureComposition


# Même rendu export que le flux par usage (barres, codes, valeurs affichées),
# avec les données par couverture de ImperFluxByCouverture.
class ImperFluxByCouvertureExport(ImperFluxByCouverture, ImperFluxByUsageExport):
    pass
