from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    CEREMA_CREDITS,
    HIGHLIGHT_COLOR,
    LEGEND_NAVIGATION_EXPORT,
)
from public_data.domain.containers import PublicDataContainer


class AnnualConsoComparisonChart(ProjectChart):
    """
    Graphique de consommation annuelle d'espaces des territoires similaires.
    """

    name = "conso comparison"

    def _get_series(self):
        """
        Génère les séries principales et les séries de drilldown.
        """

        consommation_progression = PublicDataContainer.consommation_progression_service().get_by_lands(
            lands=self.project.comparison_lands_and_self_land(),
            start_date=int(self.project.analyse_start_date),
            end_date=int(self.project.analyse_end_date),
        )

        main_series = []
        drilldown_series = []

        for land_conso in consommation_progression:
            total_conso = sum(annual_conso.total for annual_conso in land_conso.consommation)

            main_series.append(
                {
                    "name": "Tous les territoires",
                    "data": [
                        {"name": land_conso.land.name, "y": total_conso, "drilldown": land_conso.land.official_id}
                    ],
                    "color": HIGHLIGHT_COLOR if land_conso.land.official_id == self.project.land.official_id else None,
                    "grouping": False,
                    "tooltip": {
                        "headerFormat": "<b>{point.key}</b><br/>",
                        "pointFormat": (
                            "Consommation d'espaces NAF entre "
                            f"{self.project.analyse_start_date} et {self.project.analyse_end_date} : "
                            "<b>{point.y:.2f} ha</b>"
                        ),
                    },
                }
            )

            drilldown_series.append(
                {
                    "id": land_conso.land.official_id,
                    "name": land_conso.land.name,
                    "data": [
                        {
                            "name": annual_conso.year,
                            "y": annual_conso.total,
                        }
                        for annual_conso in land_conso.consommation
                    ],
                    "custom": {"parentName": land_conso.land.name},
                    "tooltip": {
                        "headerFormat": "<b>{point.series.options.custom.parentName}</b><br/>",
                        "pointFormat": "Consommation d'espaces NAF en {point.name} : <b>{point.y:.2f} ha</b><br/>",
                    },
                }
            )
        return main_series, drilldown_series

    @property
    def param(self):
        main_series, drilldown_series = self._get_series()

        return super().param | {
            "chart": {"type": "column", "height": 500},
            "title": {"text": "Consommation d'espaces NAF du territoire et des territoires similaires (ha)"},
            "subtitle": {"text": "Cliquez sur un territoire pour voir le détail de sa consommation d'espaces NAF."},
            "yAxis": {"title": {"text": "Consommation d'espaces NAF (ha)"}},
            "xAxis": {
                "type": "category",
                "labels": {
                    "rotation": -45,
                    "align": "right",
                },
            },
            "legend": {
                "enabled": False,
            },
            "series": main_series,
            "drilldown": {
                "series": drilldown_series,
                "breadcrumbs": {
                    "showFullPath": True,
                    "format": "{level.name}",
                    "buttonTheme": {"style": {"color": "#4318FF", "textDecoration": "none"}},
                },
            },
        }

    # To remove after refactoring
    def add_series(self):
        pass


class AnnualConsoComparisonChartExport(AnnualConsoComparisonChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Comparaison de la consommation d'espaces NAF entre {self.project.territory_name} "
                    "et les territoires similaires "
                    f"entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
            "subtitle": {"text": ""},
        }
