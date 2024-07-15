from collections import defaultdict

from django.contrib.gis.geos import MultiPolygon

from project.charts.constants import LEGEND_NAVIGATION_EXPORT, OCSGE_CREDITS
from project.models import Project
from public_data.models import UsageSol

from .ArtifProgressionByCouvertureChart import ArtifProgressionByCouvertureChart


class ArtifProgressionByUsageChart(ArtifProgressionByCouvertureChart):
    name = "Progression des principaux postes de l'usage du sol"

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    "Evolution de l'artificialisation par type d'usage de "
                    f"{self.project.first_year_ocsge} à {self.project.last_year_ocsge}"
                ),
            },
        }

    def __init__(self, project: Project, geom: MultiPolygon | None = None):
        super().__init__(project, geom=geom)

    def get_data(self):
        aggregate = defaultdict(lambda: {"artif": 0, "renat": 0})

        for usage in UsageSol.objects.all():
            if usage.level == 1:
                aggregate[usage.code_prefix] = {"artif": 0, "renat": 0}

        for serie in self.project.get_detail_artif(sol="usage", geom=self.geom):
            if serie["code_prefix"] == "US235":
                level_one_code = "US235"
            else:
                first_number_after_us = serie["code_prefix"].split("US")[1][0]
                level_one_code = f"US{first_number_after_us}"
            aggregate[level_one_code]["artif"] += serie["artif"]
            aggregate[level_one_code]["renat"] += serie["renat"]

        series = []

        for code, value in aggregate.items():
            usage = UsageSol.objects.get(code_prefix=code)
            if value["artif"] == 0 and value["renat"] == 0:
                continue
            series.append(
                {
                    "code_prefix": code,
                    "label": usage.label,
                    "label_short": usage.label_short,
                    "artif": value["artif"],
                    "renat": value["renat"],
                }
            )

        return series

    def get_series(self):
        return self.get_data()


class ArtifProgressionByUsageChartExport(ArtifProgressionByUsageChart):
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
                    f"Evolution de l'artificialisation par type d'usage de {self.project.first_year_ocsge} à"
                    f"{self.project.last_year_ocsge} à {self.project.territory_name}"
                )
            },
        }
