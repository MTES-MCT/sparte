"""
Abstract base for bubble comparison charts crossing an INSEE indicator
with land consumption across comparison territories.

x = indicator evolution (%)
y = consumption relative to territory surface (%)
z = population (bubble size)
"""

import logging
from functools import cached_property

from django.db.models import Sum

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import HIGHLIGHT_COLOR, INSEE_CREDITS
from project.charts.mixins.ComparisonChartMixin import ComparisonChartMixin
from public_data.models import LandConso, LandDcPopulation

logger = logging.getLogger(__name__)


class DcConsoComparisonBubbleChart(ComparisonChartMixin, DiagnosticChart):
    """
    Abstract base for bubble charts crossing a DC indicator evolution (%)
    with land consumption relative to territory surface (%) across comparison territories.
    Bubble size = population.

    Subclasses must define:
      - indicator_model
      - indicator_name: str
      - conso_field: str ("habitat", "activite", "total")
      - conso_label: str
      - start_field_11, end_field_16, start_field_16, end_field_22
      - x_axis_label: str
    """

    required_params = ["start_date", "end_date"]

    indicator_model = None
    indicator_name = ""
    indicator_unit = "%"
    conso_field = "habitat"
    conso_label = "Consommation habitat relative à la surface (%)"
    start_field_11 = ""
    end_field_16 = ""
    start_field_16 = ""
    end_field_22 = ""
    x_axis_label = ""

    @property
    def name(self):
        return f"dc {self.indicator_name} conso comparison " f"{self.params['start_date']}-{self.params['end_date']}"

    def _get_period_fields(self):
        end_date = int(self.params["end_date"])
        if end_date >= 2022:
            return self.start_field_16, self.end_field_22
        return self.start_field_11, self.end_field_16

    def _compute_indicator(self, obj, start_field, end_field):
        if obj is None:
            return None
        start = getattr(obj, start_field, None)
        end = getattr(obj, end_field, None)
        if start and end and start > 0:
            return round((end - start) / start * 100, 2)
        return None

    @cached_property
    def data(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])
        comparison_lands = self._get_comparison_lands()

        land_ids = [land.land_id for land in comparison_lands]

        # Consumption aggregated over the period
        conso_qs = (
            LandConso.objects.filter(
                land_id__in=land_ids,
                land_type__in=[land.land_type for land in comparison_lands],
                year__gte=start_date,
                year__lt=end_date,
            )
            .values("land_id")
            .annotate(total_conso=Sum(self.conso_field))
        )
        conso_by_land = {row["land_id"]: round((row["total_conso"] or 0) / 10000, 2) for row in conso_qs}

        # Surface for proportional consumption
        surface_by_land = {land.land_id: land.surface for land in comparison_lands}

        # Consumption proportional to surface (%)
        conso_proportional_by_land = {}
        for lid in land_ids:
            surface = surface_by_land.get(lid, 0)
            conso = conso_by_land.get(lid, 0)
            conso_proportional_by_land[lid] = round(conso / surface * 100, 4) if surface > 0 else 0

        # Indicator values
        start_field, end_field = self._get_period_fields()
        indic_objs = {
            obj.land_id: obj
            for obj in self.indicator_model.objects.filter(
                land_id__in=land_ids,
            )
        }
        indicator_by_land = {
            lid: self._compute_indicator(indic_objs.get(lid), start_field, end_field) for lid in land_ids
        }

        # Population for bubble size
        pop_objs = {obj.land_id: obj for obj in LandDcPopulation.objects.filter(land_id__in=land_ids)}
        pop_by_land = {}
        for lid in land_ids:
            pop_obj = pop_objs.get(lid)
            pop_by_land[lid] = (pop_obj.population_22 or pop_obj.population_16 or 0) if pop_obj else 0

        return {
            "lands": comparison_lands,
            "conso": conso_by_land,
            "conso_proportional": conso_proportional_by_land,
            "indicator": indicator_by_land,
            "population": pop_by_land,
        }

    @property
    def bubble_series(self):
        lands = self.data["lands"]
        highlighted = self.land.land_id

        return [
            {
                "name": land.name,
                "data": [
                    {
                        "x": self.data["indicator"].get(land.land_id, 0) or 0,
                        "y": self.data["conso_proportional"].get(land.land_id, 0),
                        "z": self.data["population"].get(land.land_id, 0),
                    }
                ],
                "color": HIGHLIGHT_COLOR if land.land_id == highlighted else None,
                "marker": {
                    "lineWidth": 3 if land.land_id == highlighted else 1,
                },
            }
            for land in lands
            if self.data["indicator"].get(land.land_id) is not None
        ]

    @property
    def series(self):
        return self.bubble_series

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bubble"},
            "legend": {
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
                "bubbleLegend": {
                    "enabled": True,
                    "borderWidth": 1,
                    "legendIndex": 100,
                    "labels": {"format": "{value:.0f} hab"},
                    "color": "transparent",
                    "connectorDistance": 40,
                },
            },
            "credits": INSEE_CREDITS,
            "title": {
                "text": (
                    f"{self.conso_label} au regard de "
                    f"{self.indicator_name.lower()} de {self.land.name} "
                    f"et des territoires de comparaison "
                    f"({self.params['start_date']} - {self.params['end_date']})"
                )
            },
            "xAxis": {
                "gridLineWidth": 1,
                "title": {"text": self.x_axis_label},
                "plotLines": [{"color": "#000", "width": 1, "value": 0, "zIndex": 3}],
            },
            "yAxis": {
                "title": {"text": self.conso_label},
                "maxPadding": 0.2,
                "min": 0,
            },
            "tooltip": {
                "pointFormat": (
                    f"{self.conso_label} : "
                    "<span class='fr-text--bold'>{point.y:.4f} %</span><br />"
                    f"{self.indicator_name} : "
                    "<span class='fr-text--bold'>{point.x} %</span><br />"
                    "Population : "
                    "<span class='fr-text--bold'>{point.z} hab</span>"
                ),
            },
            "series": self.series,
        }

    @property
    def data_table(self):
        headers = [
            "Territoire",
            self.conso_label,
            self.indicator_name,
            "Population (hab)",
        ]
        rows = []
        for land in self.data["lands"]:
            indic = self.data["indicator"].get(land.land_id)
            conso_prop = self.data["conso_proportional"].get(land.land_id, 0)
            rows.append(
                {
                    "name": land.name,
                    "data": [
                        land.name,
                        f"{conso_prop:.4f} %",
                        f"{indic:+.2f}%" if indic is not None else "n.d.",
                        f"{self.data['population'].get(land.land_id, 0):,.0f}",
                    ],
                }
            )
        return {"headers": headers, "rows": rows}
