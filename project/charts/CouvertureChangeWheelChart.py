from django.db.models import Sum

from project.charts.base_project_chart import ProjectChart
from public_data.models import CouvertureSol, OcsgeDiff

from .constants import LANG_MISSING_OCSGE_DIFF_ARTIF


class CouvertureChangeWheelChart(ProjectChart):
    name = "Matrice de passage de la couverture"
    prefix = "cs"
    name_sol = "couverture"
    items = CouvertureSol.objects.all()

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "dependencywheel"},
            "title": {
                "text": (
                    "Matrice d'évolution de la couverture des sols de "
                    f"{self.project.first_year_ocsge} à {self.project.last_year_ocsge}"
                ),
            },
            "lang": LANG_MISSING_OCSGE_DIFF_ARTIF,
            "accessibility": {
                "point": {
                    "valueDescriptionFormat": "{index}. From {point.from} to {point.to}: {point.weight}.",
                }
            },
            "series": [],
        }

    def add_series(self):
        self.chart["series"].append(
            {
                "keys": ["from", "to", "weight", "color"],
                "data": self.get_data(),
                "type": "dependencywheel",
                "styledMode": True,
                "dataLabels": {
                    "align": "left",
                    "crop": False,
                    "inside": False,
                    "color": "#333",
                    "style": {"textOutline": "none"},
                    "textPath": {"enabled": True},
                    "distance": 10,
                },
                "size": "100%",
                "nodes": [
                    {
                        "id": f"{_.code_prefix} {_.label_short}",
                        "color": _.map_color,
                    }
                    for _ in self.items
                ],
            }
        )

    def get_serie_label(self, code_prefix) -> str:
        return f"{code_prefix} {CouvertureSol.objects.get(code_prefix=code_prefix).label_short}"

    def get_data(self):
        self.data = (
            OcsgeDiff.objects.intersect(self.project.combined_emprise)
            .filter(
                year_old__gte=self.project.analyse_start_date,
                year_new__lte=self.project.analyse_end_date,
            )
            .values(f"{self.prefix}_old", f"{self.prefix}_new")
            .annotate(total=Sum("surface") / 10000)
            .order_by(f"{self.prefix}_old", f"{self.prefix}_new")
        )

        for data in self.data:
            data[f"{self.prefix}_old"] = self.get_serie_label(data[f"{self.prefix}_old"])
            data[f"{self.prefix}_new"] = self.get_serie_label(data[f"{self.prefix}_new"])

        return [
            [_[f"{self.prefix}_old"], _[f"{self.prefix}_new"], round(_["total"], 2)]
            for _ in self.data
            if _[f"{self.prefix}_old"] != _[f"{self.prefix}_new"]
        ]
