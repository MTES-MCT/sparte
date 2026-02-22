from public_data.models import LandDcMenages

from .DcBivariateConsoMap import PALETTE_TEAL, DcBivariateConsoMap


class DcMenagesConsoMap(DcBivariateConsoMap):
    """Bivariate map: household evolution × land consumption."""

    name = "dc menages conso map"
    bivariate_colors = PALETTE_TEAL
    indicator_name = "Évolution du nombre de ménages"
    indicator_short = "évol. ménages"
    indicator_unit = "%"
    indicator_gender = "f"
    indicator_model = LandDcMenages

    verdicts = [
        [
            "Peu de consommation et faible croissance des ménages : territoire stable et sobre.",
            "Peu de consommation avec une croissance modérée des ménages : urbanisme bien dimensionné.",
            "Peu de consommation malgré une forte croissance des ménages : densification réussie.",
        ],
        [
            "Consommation modérée mais peu de ménages supplémentaires : étalement peu justifié par les besoins.",
            "Consommation et croissance des ménages dans la moyenne du territoire.",
            "Consommation modérée pour une forte croissance des ménages : réponse adaptée aux besoins.",
        ],
        [
            "Forte consommation sans croissance significative des ménages : l'étalement ne répond pas à un besoin.",
            "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
            "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
        ],
    ]

    @property
    def period_years(self):
        if self.period == "2011_2016":
            return ("menages_11", "menages_16", 2011, 2016)
        return ("menages_16", "menages_22", 2016, 2022)

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
