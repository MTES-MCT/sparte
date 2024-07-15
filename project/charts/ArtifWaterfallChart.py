from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    LANG_MISSING_OCSGE_DIFF_ARTIF,
    OCSGE_CREDITS,
)


class ArtifWaterfallChart(ProjectChart):
    name = "Evolution de l'artificialisation"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Progression de l'artificialisation nette"},
            "yAxis": {
                "title": {"text": "Surface (en ha)"},
                "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
            },
            "tooltip": {
                "pointFormat": "{point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "lang": LANG_MISSING_OCSGE_DIFF_ARTIF,
            "xAxis": {"type": "category"},
            "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
            "plotOptions": {
                "column": {
                    "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                    "pointPadding": 0.2,
                    "borderWidth": 0,
                }
            },
            "series": [],
        }

    def get_series(self):
        if not self.series:
            self.series = self.project.get_artif_progession_time_scoped()
        return self.series

    def add_series(self):
        series = self.get_series()

        years_str = f"{self.project.first_year_ocsge} - {self.project.last_year_ocsge}"
        new_artif = series["new_artif"]
        new_desartif = series["new_natural"]
        artif_nette = new_artif - new_desartif
        total_artif_data = [{"name": years_str, "y": new_artif}] if new_artif != 0 else []
        total_desartif_data = [{"name": years_str, "y": new_desartif}] if new_desartif != 0 else []
        artif_nette_data = [{"name": years_str, "y": artif_nette}] if artif_nette != 0 else []

        self.chart["series"] = [
            {
                "name": "Artificialisation",
                "data": total_artif_data,
                "color": "#ff0000",
            },
            {
                "name": "Désartificialisation",
                "data": total_desartif_data,
                "color": "#00ff00",
            },
            {
                "name": "Artificialisation nette",
                "data": artif_nette_data,
                "color": "#0000ff",
            },
        ]


class ArtifWaterfallChartExport(ArtifWaterfallChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": (
                    f"Progression de l'artificialisation nette pour {self.project.territory_name}"
                    f" entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
