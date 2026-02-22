from public_data.models import LandDcLogement

from .DcBivariateConsoMap import PALETTE_DIVERGING, DcBivariateConsoMap


class DcVacanceConsoMap(DcBivariateConsoMap):
    """
    Bivariate map: housing vacancy rate × land consumption.

    NOTE: for this map, high indicator = high vacancy = BAD.
    So the color logic is inverted on the indicator axis:
    high vacancy + high conso = worst (red), low vacancy + low conso = best (green).
    The default color scheme already works because both axes are "bad when high".
    """

    name = "dc vacance conso map"
    bivariate_colors = PALETTE_DIVERGING
    conso_field = "habitat"
    indicator_name = "Taux de vacance des logements"
    indicator_short = "taux vacance"
    indicator_unit = "%"
    indicator_model = LandDcLogement

    verdicts = [
        [
            "Peu de consommation et faible vacance : territoire dynamique et sobre en foncier.",
            "Peu de consommation avec une vacance modérée : sobriété foncière malgré des logements sous-utilisés.",
            "Peu de consommation mais forte vacance : pas d'étalement mais un parc de logements sous-utilisé.",
        ],
        [
            "Consommation modérée et faible vacance : le parc est bien occupé.",
            "Consommation et vacance dans la moyenne du territoire.",
            "Consommation modérée malgré une forte vacance : du potentiel de renouvellement existe.",
        ],
        [
            "Forte consommation et faible vacance : la tension immobilière peut expliquer l'étalement.",
            "Forte consommation avec une vacance modérée : l'étalement pourrait être réduit.",
            "Situation la plus défavorable : forte consommation d'espaces "
            "alors que de nombreux logements sont vacants.",
        ],
    ]

    @property
    def period_years(self):
        # Vacancy rate is a snapshot, not an evolution – we use the end year data
        if self.period == "2011_2016":
            return ("logements_16", "logements_vacants_16", 2011, 2016)
        return ("logements_22", "logements_vacants_22", 2016, 2022)

    def compute_indicator_value(self, obj, start_field, end_field):
        """Vacancy rate = logements_vacants / logements × 100."""
        if obj is None:
            return None
        total = getattr(obj, start_field, None)  # logements_XX
        vacant = getattr(obj, end_field, None)  # logements_vacants_XX
        if total and vacant is not None and total > 0:
            return round(vacant / total * 100, 2)
        return None

    def format_indicator(self, value):
        if value is None:
            return "n.d."
        return f"{value:.1f}%"

    def get_chart_subtitle(self):
        return (
            "Croisement entre le taux de vacance des logements (INSEE) "
            "et la consommation d'espaces NAF (fichiers fonciers). "
            "Vert = situation favorable, rouge = défavorable."
        )
