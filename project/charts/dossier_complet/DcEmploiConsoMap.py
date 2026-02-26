from public_data.models import LandDcActiviteChomage

from .DcBivariateConsoMap import PALETTE_PURPLE, DcBivariateConsoMap


class DcEmploiConsoMap(DcBivariateConsoMap):
    """Bivariate map: employment evolution × land consumption for activity."""

    name = "dc emploi conso map"
    bivariate_colors = PALETTE_PURPLE
    conso_field = "activite"
    indicator_name = "Évolution de l'emploi"
    indicator_short = "évol. emploi"
    indicator_unit = "%"
    indicator_gender = "f"
    indicator_model = LandDcActiviteChomage

    verdicts = [
        [
            "Peu de consommation et emploi en recul : territoire en retrait mais économe en foncier.",
            "Peu de consommation avec un emploi stable : sobriété foncière dans un contexte modéré.",
            "Peu de consommation malgré une forte dynamique d'emploi : développement économique sobre.",
        ],
        [
            "Consommation modérée sans dynamique d'emploi : étalement peu justifié par l'activité économique.",
            "Consommation et emploi dans la moyenne du territoire.",
            "Consommation modérée accompagnée d'une bonne dynamique d'emploi.",
        ],
        [
            "Forte consommation sans création d'emploi : étalement non justifié par l'activité économique.",
            "Forte consommation pour un développement économique limité.",
            "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
        ],
    ]

    @property
    def period_years(self):
        if self.period == "2011_2016":
            return ("actifs_occupes_15_64_11", "actifs_occupes_15_64_16", 2011, 2016)
        return ("actifs_occupes_15_64_16", "actifs_occupes_15_64_22", 2016, 2022)

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
