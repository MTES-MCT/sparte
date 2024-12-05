from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.domain.containers import PublicDataContainer


class AnnualConsoByDeterminantChart(ProjectChart):
    """
    Graphique en barre de consommation annuelle par destination (habitat, activité, mixte etc.)
    """

    name = "determinant per year"

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        consommation_progression = PublicDataContainer.consommation_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=self.project.analyse_start_date,
            end_date=self.project.analyse_end_date,
        )

        category_to_attr = {
            "Habitat": "habitat",
            "Activité": "activite",
            "Mixte": "mixte",
            "Route": "route",
            "Ferré": "ferre",
            "Inconnu": "non_reseigne",
            "Total": "total",
        }

        data = {category: {} for category in category_to_attr.keys()}

        for annual_conso in consommation_progression.consommation:
            for category, attr in category_to_attr.items():
                data[category][annual_conso.year] = getattr(annual_conso, attr, None)

        series = [
            {
                "name": determinant,
                "data": [{"name": year, "y": value} for year, value in data[determinant].items()],
            }
            for determinant in data
        ]

        return series

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Par an"},
            "yAxis": {
                "title": {"text": "Consommation annuelle (en ha)"},
                "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
            },
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "xAxis": {"type": "category"},
            "legend": {
                **super().param["legend"],
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
            },
            "plotOptions": {
                "column": {
                    "stacking": "normal",
                    "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                }
            },
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass


class AnnualConsoByDeterminantChartExport(AnnualConsoByDeterminantChart):
    @property
    def param(self):
        return super().param | {
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "credits": CEREMA_CREDITS,
            "title": {
                "text": (
                    f"Consommation annuelle d'espace par destination de {self.project.territory_name}"
                    f" entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
