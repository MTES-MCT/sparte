from public_data.models import LandDcLogement

from .DcBivariateConsoMap import PALETTE_ORANGE, DcBivariateConsoMap


class DcResidencesSecondairesConsoMap(DcBivariateConsoMap):
    """Bivariate map: secondary residence rate × land consumption."""

    name = "dc residences secondaires conso map"
    bivariate_colors = PALETTE_ORANGE
    conso_field = "habitat"
    indicator_name = "Taux de résidences secondaires"
    indicator_short = "taux rés. sec."
    indicator_unit = "%"
    indicator_model = LandDcLogement

    verdicts = [
        [
            "Peu de consommation et peu de résidences secondaires : territoire résidentiel sobre.",
            "Peu de consommation avec un taux modéré de résidences secondaires.",
            "Peu de consommation malgré un fort taux de résidences secondaires : pression touristique contenue.",
        ],
        [
            "Consommation modérée et peu de résidences secondaires : l'étalement n'est pas lié au tourisme.",
            "Consommation et taux de résidences secondaires dans la moyenne du territoire.",
            "Consommation modérée avec un fort taux de résidences secondaires : "
            "le tourisme résidentiel contribue à la consommation.",
        ],
        [
            "Forte consommation sans résidences secondaires significatives : l'étalement a d'autres causes.",
            "Forte consommation avec un taux modéré de résidences secondaires.",
            "Forte consommation et fort taux de résidences secondaires : "
            "le tourisme résidentiel est un moteur de l'étalement.",
        ],
    ]

    @property
    def period_years(self):
        s, e = self.start_date, self.end_date
        if e <= 2016:
            return ("logements_16", "residences_secondaires_16", s, e)
        return ("logements_22", "residences_secondaires_22", s, e)

    def compute_indicator_value(self, obj, start_field, end_field):
        """Secondary residence rate = residences_secondaires / logements × 100."""
        if obj is None:
            return None
        total = getattr(obj, start_field, None)
        rs = getattr(obj, end_field, None)
        if total and rs is not None and total > 0:
            return round(rs / total * 100, 2)
        return None

    def format_indicator(self, value):
        if value is None:
            return "n.d."
        return f"{value:.1f}%"

    def get_chart_subtitle(self):
        return (
            "Croisement entre le taux de résidences secondaires (INSEE) "
            "et la consommation d'espaces NAF (fichiers fonciers)."
        )
