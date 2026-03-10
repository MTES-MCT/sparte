from public_data.models import LandDcLogement

from .DcBivariateConsoMap import PALETTE_BLUE, DcBivariateConsoMap


class DcLogementConsoMap(DcBivariateConsoMap):
    """Bivariate map: housing stock evolution × land consumption."""

    name = "dc logement conso map"
    bivariate_colors = PALETTE_BLUE
    conso_field = "habitat"
    indicator_name = "Évolution du parc de logements"
    indicator_short = "évol. logements"
    indicator_unit = "%"
    indicator_gender = "f"
    indicator_model = LandDcLogement

    verdicts = [
        [
            "Peu de consommation et faible construction : territoire à faible dynamique immobilière.",
            "Peu de consommation avec une construction modérée : urbanisme maîtrisé.",
            "Peu de consommation malgré une forte construction : densification exemplaire.",
        ],
        [
            "Consommation modérée pour une faible construction : étalement sans réelle demande.",
            "Consommation et construction dans la moyenne : situation intermédiaire.",
            "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
        ],
        [
            "Forte consommation sans construction significative : étalement non justifié par le logement.",
            "Forte consommation pour une construction modérée : étalement disproportionné.",
            "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
        ],
    ]

    @property
    def period_years(self):
        s, e = self.start_date, self.end_date
        if e <= 2016:
            return ("logements_11", "logements_16", s, e)
        if s >= 2016:
            return ("logements_16", "logements_22", s, e)
        return ("logements_11", "logements_22", s, e)

    def compute_indicator_value(self, obj, start_field, end_field):
        if obj is None:
            return None
        start = getattr(obj, start_field, None)
        end = getattr(obj, end_field, None)
        if start and end and start > 0:
            return round((end - start) / start * 100, 2)
        return None

    def format_indicator(self, value):
        if value is None:
            return "n.d."
        return f"{value:+.1f}%"
