from .DcBivariateConsoMap import PALETTE_ORANGE, DcBivariateConsoMap


class DcResidencesSecondairesConsoMap(DcBivariateConsoMap):
    """Bivariate map: secondary residence rate × land consumption."""

    name = "dc residences secondaires conso map"
    indicator_key = "residences_secondaires"
    bivariate_colors = PALETTE_ORANGE
    conso_field = "habitat"
    indicator_name = "Taux de résidences secondaires"
    indicator_short = "taux rés. sec."
    indicator_unit = "%"

    verdicts = [
        [
            "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
            "Peu de consommation avec un taux modéré de résidences secondaires.",
            "Peu de consommation malgré un fort taux de résidences secondaires : pression touristique contenue.",
        ],
        [
            "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
            "Consommation et taux de résidences secondaires dans la moyenne du territoire.",
            (
                "Consommation modérée avec un fort taux de résidences secondaires : "
                "le tourisme résidentiel contribue à la consommation."
            ),
        ],
        [
            "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
            "Forte consommation avec un taux modéré de résidences secondaires.",
            (
                "Forte consommation et fort taux de résidences secondaires : "
                "le tourisme résidentiel est un moteur de l'étalement."
            ),
        ],
    ]

    def format_indicator(self, value):
        """No + prefix: this is a static rate, not an evolution."""
        if value is None:
            return "n.d."
        return f"{value:.1f}%"

    def get_chart_subtitle(self):
        return (
            "Croisement entre le taux de résidences secondaires (INSEE) "
            "et la consommation d'espaces NAF (fichiers fonciers)."
        )
