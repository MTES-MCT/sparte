from typing import Dict, List

from django.contrib.gis.geos import MultiPolygon

from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_HEADER_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    IMPERMEABLE_OCSGE_CREDITS,
    LEGEND_NAVIGATION_EXPORT,
)
from project.models import Project
from public_data.domain.impermeabilisation.get_geom_new_imper_and_desimper import (
    get_geom_new_imper_and_desimper,
)


class ImperProgressionByCouvertureChart(ProjectChart):
    name = "Progression des principaux postes de la couverture du sol"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column", "alignThresholds": True},
            "title": {
                "text": (
                    f"Evolution de l'imperméabilisation par type de couverture de {self.project.first_year_ocsge} à "
                    f"{self.project.last_year_ocsge}"
                )
            },
            "yAxis": {
                "title": {"text": "Progression (en ha)"},
            },
            "tooltip": {
                "pointFormat": "{point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "headerFormat": DEFAULT_HEADER_FORMAT,
            },
            "xAxis": {"type": "category"},
            "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
            "series": [],
        }

    def __init__(self, project: Project, geom: MultiPolygon | None = None):
        self.geom = geom
        super().__init__(project)

    def get_data(self):
        return get_geom_new_imper_and_desimper(
            geom=self.project.combined_emprise,
            analyse_start_date=self.project.first_year_ocsge,
            analyse_end_date=self.project.last_year_ocsge,
        )["couverture"]

    def add_series(self) -> List[Dict]:
        self.chart["series"].append(
            {
                "name": "Imperméabilisation",
                "data": [
                    {
                        "name": item["code_prefix"],
                        "y": item["imper"],
                    }
                    for item in self.get_data()
                ],
            }
        )
        self.chart["series"].append(
            {
                "name": "Désimperméabilisation",
                "data": [
                    {
                        "name": item["code_prefix"],
                        "y": item["desimper"],
                    }
                    for item in self.get_data()
                ],
            }
        )


class ImperProgressionByCouvertureChartExport(ImperProgressionByCouvertureChart):
    @property
    def param(self):
        return super().param | {
            "chart": {
                **super().param["chart"],
                "spacingBottom": 50,
            },
            "credits": IMPERMEABLE_OCSGE_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Evolution de l'imperméabilisation par type de couverture de {self.project.first_year_ocsge} à "
                    f"{self.project.last_year_ocsge} à {self.project.territory_name}"
                )
            },
            "plotOptions": {
                "column": {
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:,.1f}",
                        "allowOverlap": True,
                    },
                }
            },
        }
