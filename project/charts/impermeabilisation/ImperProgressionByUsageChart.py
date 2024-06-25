from collections import defaultdict
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
from public_data.models import UsageSol


class ImperProgressionByUsageChart(ProjectChart):
    name = "Progression des principaux postes de la couverture du sol"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column", "alignThresholds": True},
            "title": {
                "text": (
                    f"Evolution de l'imperméabilisation par type d'usage de {self.project.first_year_ocsge} à "
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
        data = get_geom_new_imper_and_desimper(
            geom=self.project.combined_emprise,
            analyse_start_date=self.project.first_year_ocsge,
            analyse_end_date=self.project.last_year_ocsge,
        )["usage"]

        aggregate = defaultdict(lambda: {"imper": 0, "desimper": 0})

        for usage in UsageSol.objects.all():
            if usage.level == 1:
                aggregate[usage.code_prefix] = {"imper": 0, "desimper": 0}

        for serie in data:
            if serie["code_prefix"] == "US235":
                level_one_code = "US235"
            else:
                first_number_after_us = serie["code_prefix"].split("US")[1][0]
                level_one_code = f"US{first_number_after_us}"
            aggregate[level_one_code]["imper"] += serie["imper"]
            aggregate[level_one_code]["desimper"] += serie["desimper"]

        series = []

        for code, value in aggregate.items():
            usage = UsageSol.objects.get(code_prefix=code)
            series.append(
                {
                    "code_prefix": code,
                    "label": usage.label,
                    "label_short": usage.label_short,
                    "imper": value["imper"],
                    "desimper": value["desimper"],
                }
            )

        return series

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


class ImperProgressionByUsageChartExport(ImperProgressionByUsageChart):
    @property
    def param(self):
        return super().param | {
            "credits": IMPERMEABLE_OCSGE_CREDITS,
            "chart": {
                **super().param["chart"],
                "spacingBottom": 50,
            },
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
