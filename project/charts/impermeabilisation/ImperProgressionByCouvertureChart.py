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
from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifferenceService import (
    ImpermeabilisationDifferenceService,
)
from public_data.infra.impermeabilisation.difference.highchart.ImperProgressionMapper import (
    ImperProgressionMapper,
)


class ImperProgressionByCouvertureChart(ProjectChart):
    _sol = "couverture"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column", "alignThresholds": True},
            "title": {
                "text": (
                    f"Evolution de l'imperméabilisation par type de {self._sol} de {self.project.first_year_ocsge} à "
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

    def add_series(self) -> List[Dict]:
        difference = ImpermeabilisationDifferenceService.get_by_geom(
            geom=self.project.combined_emprise,
            start_date=self.project.first_year_ocsge,
            end_date=self.project.last_year_ocsge,
        )
        series = ImperProgressionMapper.map(difference)
        self.chart["series"] = series[self._sol]


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
                    f"Evolution de l'imperméabilisation par type de {self._sol} de {self.project.first_year_ocsge} à "
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
