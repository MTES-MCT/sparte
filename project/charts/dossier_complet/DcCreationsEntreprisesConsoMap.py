from public_data.models import LandDcCreationsEntreprises

from .DcBivariateConsoMap import PALETTE_CREATIONS, DcBivariateConsoMap


class DcCreationsEntreprisesConsoMap(DcBivariateConsoMap):
    """Bivariate map: business creation evolution × land consumption for activity."""

    name = "dc creations entreprises conso map"
    bivariate_colors = PALETTE_CREATIONS
    conso_field = "activite"
    indicator_name = "Évolution des créations d'entreprises"
    indicator_short = "évol. créations"
    indicator_unit = "%"
    indicator_gender = "f"
    indicator_model = LandDcCreationsEntreprises

    verdicts = [
        [
            "Peu de consommation et créations en recul : territoire économiquement atone mais sobre.",
            "Peu de consommation avec des créations stables : sobriété foncière.",
            "Peu de consommation malgré un fort dynamisme entrepreneurial : développement sobre.",
        ],
        [
            "Consommation modérée sans dynamique entrepreneuriale.",
            "Consommation et créations d'entreprises dans la moyenne du territoire.",
            "Consommation modérée accompagnée d'un bon dynamisme entrepreneurial.",
        ],
        [
            "Forte consommation sans dynamique entrepreneuriale : "
            "étalement non justifié par la création d'entreprises.",
            "Forte consommation pour un dynamisme entrepreneurial limité.",
            "Forte consommation accompagnée d'un fort dynamisme entrepreneurial.",
        ],
    ]

    @property
    def period_years(self):
        if self.period == "2011_2016":
            return ("2012_2015", "2016_2019", 2011, 2016)
        return ("2016_2019", "2020_2023", 2016, 2022)

    def _sum_creations(self, obj, year_range_key):
        """Sum creations_entreprises over a year range like '2016_2019'."""
        start, end = year_range_key.split("_")
        total = 0
        count = 0
        for y in range(int(start), int(end) + 1):
            val = getattr(obj, f"creations_entreprises_{y}", None)
            if val is not None:
                total += val
                count += 1
        return (total, count) if count > 0 else (None, 0)

    def compute_indicator_value(self, obj, start_field, end_field):
        if obj is None:
            return None
        start_total, start_count = self._sum_creations(obj, start_field)
        end_total, end_count = self._sum_creations(obj, end_field)
        if start_total is None or end_total is None:
            return None
        avg_start = start_total / start_count
        avg_end = end_total / end_count
        if avg_start > 0:
            return round((avg_end - avg_start) / avg_start * 100, 2)
        return None

    def format_indicator(self, value):
        if value is None:
            return "n.d."
        return f"{value:+.1f}%"
