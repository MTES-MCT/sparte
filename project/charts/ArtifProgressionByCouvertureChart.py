from typing import Dict, List

from django.contrib.gis.geos import MultiPolygon

from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    DEFAULT_HEADER_FORMAT,
    DEFAULT_VALUE_DECIMALS,
    LANG_MISSING_OCSGE_DIFF_ARTIF,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
from project.models import Project
from public_data.models import CouvertureSol


class ArtifProgressionByCouvertureChart(ProjectChart):
    name = "Progression des principaux postes de la couverture du sol"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column", "alignThresholds": True},
            "title": {
                "text": (
                    f"Evolution de l'artificialisation par type de couverture de {self.project.first_year_ocsge} à "
                    f"{self.project.last_year_ocsge}"
                )
            },
            "yAxis": {
                "title": {"text": "Progression (en ha)"},
            },
            "lang": LANG_MISSING_OCSGE_DIFF_ARTIF,
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
        """Should return data formated like this:
        [
            {
                "code_prefix": "CS1.1.1",
                "label": "Zone Bâti (maison,...)",
                "label_short": "Zone Bâti",
                "map_color": "#FF0000",
                "surface": 1000.0,
            },
            {...}
        ]
        """
        return self.project.get_detail_artif(sol="couverture", geom=self.geom)

    def get_series(self) -> List[Dict]:
        series = []

        for item in self.get_data():
            couverture = CouvertureSol.objects.get(code_prefix=item["code_prefix"])
            series.append(
                {
                    "code_prefix": item["code_prefix"],
                    "label": couverture.label,
                    "label_short": couverture.label_short,
                    "artif": item["artif"],
                    "renat": item["renat"],
                }
            )

        return series

    def add_series(self, *args, **kwargs) -> None:
        self.chart["series"].append(
            {
                "name": "Artificialisation",
                "data": [
                    {
                        "name": item["code_prefix"],
                        "y": item["artif"],
                    }
                    for item in self.get_series()
                ],
            }
        )
        self.chart["series"].append(
            {
                "name": "Désartificialisation",
                "data": [
                    {
                        "name": item["code_prefix"],
                        "y": item["renat"],
                    }
                    for item in self.get_series()
                ],
            }
        )


class ArtifProgressionByCouvertureChartExport(ArtifProgressionByCouvertureChart):
    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": (
                    f"Evolution de l'artificialisation par type de couverture de {self.project.first_year_ocsge} à "
                    f"{self.project.last_year_ocsge} à {self.project.territory_name}"
                )
            },
        }
