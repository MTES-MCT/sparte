from collections import defaultdict
from datetime import date
import re

from django.db.models import Count, CharField, Func, F, Value

from highcharts import charts
from project.models import Project, Request
from utils.matomo import Matomo


class DiagAndDownloadChart(charts.Chart):
    name = "Diagnostic created and downloaded per month"
    param = {
        "chart": {"type": "column"},
        "title": {"text": "Diagnostics créés et téléchargés par mois"},
        "yAxis": {
            "title": {"text": "Nombre"},
            "stackLabels": {"enabled": True, "format": "{total:,.0f}"},
        },
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "plotOptions": {
            "column": {
                "stacking": "normal",
                "dataLabels": {"enabled": True, "format": "{point.y:,.0f}"},
            }
        },
        "series": [],
    }

    def get_series(self):
        if not self.series:
            qs_created = (
                Project.objects.annotate(
                    date=Func(
                        F("created_date"),
                        Value("yyyy-MM"),
                        function="to_char",
                        output_field=CharField(),
                    )
                )
                .values("date")
                .annotate(total=Count("id"))
                .order_by("date")
            )
            qs_dl = (
                Request.objects.annotate(
                    date=Func(
                        F("created_date"),
                        Value("yyyy-MM"),
                        function="to_char",
                        output_field=CharField(),
                    )
                )
                .values("date")
                .annotate(total=Count("id"))
            )
            self.series = {
                "Créés": {row["date"]: row["total"] for row in qs_created},
                "Téléchargés": {row["date"]: row["total"] for row in qs_dl},
            }
        return self.series


class UseOfReportPieChart(charts.Chart):
    name = "How reports tab are opened"
    param = {
        "chart": {"type": "pie"},
        "title": {"text": "Rapports consultés (12 derniers mois)"},
        "yAxis": {
            "title": {"text": "Ouverture"},
            "stackLabels": {"enabled": True, "format": "{total:,.1f}"},
        },
        "tooltip": {"enabled": False, "pointFormat": "{point.name}: {point.y}"},
        "xAxis": {"type": "category"},
        "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
        "plotOptions": {
            "pie": {
                "allowPointSelect": True,
                "cursor": "pointer",
                "dataLabels": {
                    "enabled": True,
                    "format": "<b>{point.name}</b>: {point.y}",
                },
            }
        },
        "series": [],
    }

    def get_series(self):
        def t(title):
            if title == "map":
                return "Carte intéractive"
            elif title == "synthesis":
                return "Synthèse"
            else:
                return title

        if not self.series:
            self.end = date.today()
            self.start = date(year=self.end.year - 1, month=self.end.month + 1, day=1)
            mato = Matomo(period=(self.start, self.end))
            re_map = re.compile(
                r"(consommation|couverture|synthesis|usage|artificialisation|map)"
            )
            self.series = defaultdict(lambda: 0)
            for row in mato.request():
                match = re_map.search(row["label"])
                if match:
                    self.series[t(match.group(0))] += row["nb_hits"]
        return {"Page du rapport": self.series}
