from public_data.models import AdminRef, LandDcActiviteChomage

from .DcBivariateConsoMap import PALETTE_DIVERGING, DcBivariateConsoMap


class DcChomageConsoMap(DcBivariateConsoMap):
    """Bivariate map: unemployment rate × land consumption for activity."""

    name = "dc chomage conso map"
    bivariate_colors = PALETTE_DIVERGING
    conso_field = "activite"
    indicator_name = "Taux de chômage"
    indicator_short = "taux chômage"
    indicator_unit = "%"
    indicator_model = LandDcActiviteChomage

    verdicts = [
        [
            "Peu de consommation pour l'activité et chômage faible : territoire économiquement sobre et dynamique.",
            "Peu de consommation pour l'activité avec un chômage modéré.",
            "Peu de consommation pour l'activité malgré un chômage élevé : faible attractivité économique.",
        ],
        [
            "Consommation modérée pour l'activité avec un faible chômage : développement économique équilibré.",
            "Consommation et chômage dans la moyenne du territoire.",
            "Consommation modérée pour l'activité malgré un chômage élevé : "
            "la consommation ne profite pas à l'emploi local.",
        ],
        [
            "Forte consommation pour l'activité et faible chômage : dynamisme économique consommateur de foncier.",
            "Forte consommation pour l'activité avec un chômage modéré.",
            "Forte consommation pour l'activité et chômage élevé : "
            "étalement économique sans bénéfice pour l'emploi local.",
        ],
    ]

    @property
    def period_years(self):
        s, e = self.start_date, self.end_date
        if e <= 2016:
            return ("chomeurs_15_64_11", "actifs_15_64_11", s, e)
        return ("chomeurs_15_64_22", "actifs_15_64_22", s, e)

    def compute_indicator_value(self, obj, start_field, end_field):
        """Unemployment rate = chomeurs / actifs × 100."""
        if obj is None:
            return None
        chomeurs = getattr(obj, start_field, None)
        actifs = getattr(obj, end_field, None)
        if chomeurs is not None and actifs and actifs > 0:
            return round(chomeurs / actifs * 100, 2)
        return None

    def format_indicator(self, value):
        if value is None:
            return "n.d."
        return f"{value:.1f}%"

    def get_chart_title(self):
        _, _, conso_start, conso_end = self.period_years
        child_label = self.formatted_child_land_type
        container = self._container_land
        if self.land.land_type == AdminRef.COMMUNE:
            return (
                f"Taux de chômage et consommation d'espaces pour l'activité des {child_label}s"
                f" - {self.land.name} ({container.name}, {conso_start}-{conso_end})"
            )
        return (
            f"Taux de chômage et consommation d'espaces pour l'activité des {child_label}s"
            f" - {container.name} ({conso_start}-{conso_end})"
        )

    def get_chart_subtitle(self):
        return (
            "Croisement entre le taux de chômage (INSEE) "
            "et la consommation d'espaces pour l'activité (fichiers fonciers)."
        )
