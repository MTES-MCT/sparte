import json

from django.core.serializers import serialize
from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    LEGEND_NAVIGATION_EXPORT,
    MAP_NAVIGATION_EXPORT,
    MAP_NORTH_INDICATOR,
    OCSGE_CREDITS,
)
from public_data.models import AdminRef, LandImperStockIndex, LandModel


class ImperMap(DiagnosticChart):
    @property
    def lands(self):
        return LandModel.objects.filter(
            parent_keys__contains=[f"{self.land.land_type}_{self.land.land_id}"],
            land_type=self.params.get("child_land_type"),
        )

    @property
    def imper(self):
        return LandImperStockIndex.objects.filter(
            land_id__in=self.lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("index"),
        ).order_by("land_id")

    @property
    def previous_imper(self):
        return LandImperStockIndex.objects.filter(
            land_id__in=self.lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("previous_index"),
        ).order_by("land_id")

    @cached_property
    def data(self):
        return [
            {
                "land_id": current.land_id,
                "percent": current.percent,
                "surface": current.surface,
                "flux_percent": current.percent - previous.percent,
                "flux_surface": current.surface - previous.surface,
                "years": current.years,
                "previous_years": previous.years,
                "years_str": ", ".join(map(str, current.years)),
                "previous_years_str": ", ".join(map(str, previous.years)),
            }
            for current, previous in zip(self.imper.all(), self.previous_imper.all())
        ]

    @property
    def year_or_index_before(self):
        if self.is_interdepartemental:
            return f"millesime n°{self.params.get('previous_index')}"
        else:
            return str(self.previous_imper.first().years[0])

    @property
    def year_or_index_after(self):
        if self.is_interdepartemental:
            return f"millesime n°{self.params.get('index')}"
        else:
            return str(self.imper.first().years[-1])

    @property
    def data_table(self):
        headers = [
            AdminRef.get_label(self.params.get("child_land_type")),
            f"Part imperméabilisée (%) - {self.year_or_index_after}",
            f"Surface imperméabilisée (ha) - {self.year_or_index_after}",
            f"Imperméabilisation (ha) - {self.year_or_index_before} -> {self.year_or_index_after}",
            f"Imperméabilisation (%) - {self.year_or_index_before} -> {self.year_or_index_after}",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [
                        self.lands.get(land_id=d["land_id"]).name,
                        round(d["percent"], 2),
                        round(d["surface"], 2),
                        round(d["flux_surface"], 2),
                        round(d["flux_percent"], 2),
                    ],
                }
                for d in self.data
            ],
        }

    @property
    def is_interdepartemental(self):
        return self.lands.values("departements").distinct().count() > 1

    @property
    def title_end(self):
        if self.is_interdepartemental:
            return f"entre le {self.year_or_index_before} et le {self.year_or_index_after}"
        return f"entre {self.year_or_index_before} et {self.year_or_index_after}"

    @property
    def formatted_child_land_type(self):
        """
        Retourne le label de EPCI et SCOT en majuscule, sinon en minuscule
        """
        child_land_type = self.params.get("child_land_type")
        if child_land_type in [AdminRef.SCOT, AdminRef.EPCI]:
            return AdminRef.get_label(self.params.get("child_land_type"))
        return AdminRef.get_label(self.params.get("child_land_type")).lower()

    @property
    def param(self):
        geojson = serialize(
            "geojson",
            self.lands,
            geometry_field="simple_geom",
            fields=(
                "land_id",
                "name",
            ),
            srid=3857,
        )
        return super().param | {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": (f"Imperméabilisation des {self.formatted_child_land_type}s {self.title_end}")  # noqa: E501
            },
            "mapNavigation": {"enabled": self.lands.count() > 20},
            "legend": {
                "title": {"text": "Taux d'imperméabilisation (%)"},
                "backgroundColor": "#ffffff",
                "bubbleLegend": {
                    "enabled": True,
                    "borderWidth": 1,
                    "legendIndex": 100,
                    "labels": {"format": "{value:.0f} ha"},
                    "color": "transparent",
                    "borderColor": "#000",
                    "connectorDistance": 40,
                    "connectorColor": "#000",
                },
            },
            "colorAxis": {
                "min": min([d["percent"] for d in self.data]),
                "max": max([d["percent"] for d in self.data]),
                "minColor": "#FFFFFF",
                "maxColor": "#6a6af4",
                "dataClassColor": "category",
            },
            "series": [
                {
                    "name": "Surfaces imperméables",
                    "data": self.data,
                    "joinBy": ["land_id"],
                    "colorKey": "percent",
                    "opacity": 1,
                    "showInLegend": False,
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.name}",
                        "y": 10,
                    },
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>" "{point.surface:,.1f} ha " "({point.percent:,.2f} %) "
                        ),
                    },
                },
                {
                    "name": "Imperméabilisation",
                    "type": "mapbubble",
                    "joinBy": ["land_id"],
                    "showInLegend": True,
                    "maxSize": 50,
                    "marker": {
                        "fillOpacity": 0.5,
                    },
                    "color": "#ff5b5b",
                    "data": [
                        {
                            "land_id": d["land_id"],
                            "z": abs(d["flux_surface"]),
                            "color": "#FC9292",
                            "flux_surface": d["flux_surface"],
                            "flux_percent": d["flux_percent"],
                            "years": d["years_str"],
                            "previous_years": d["previous_years_str"],
                        }
                        for d in self.data
                        if d["flux_surface"] > 0
                    ],
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>"
                            "+{point.flux_surface:,.1f} ha "
                            "(+{point.flux_percent:,.2f} %) "
                        ),
                    },
                },
                {
                    "name": "Flux de désimperméabilisation",
                    "type": "mapbubble",
                    "joinBy": ["land_id"],
                    "showInLegend": True,
                    "maxSize": 50,
                    "marker": {
                        "fillOpacity": 0.5,
                    },
                    "color": "#7ec974",
                    "data": [
                        {
                            "land_id": d["land_id"],
                            "z": abs(d["flux_surface"]),
                            "color": "#7ec974",
                            "flux_surface": d["flux_surface"],
                            "flux_percent": d["flux_percent"],
                            "years": d["years_str"],
                            "previous_years": d["previous_years_str"],
                        }
                        for d in self.data
                        if d["flux_surface"] < 0
                    ],
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>"
                            "{point.flux_surface:,.1f} ha "
                            "({point.flux_percent:,.2f} %) "
                        ),
                    },
                },
            ],
        }


class ImperMapExport(ImperMap):
    @property
    def param(self):
        return super().param | {
            "chart": {
                **super().param["chart"],
                "height": "800px",
            },
            "credits": OCSGE_CREDITS,
            "mapNavigation": MAP_NAVIGATION_EXPORT,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": f"{super().param['title']['text']} sur le territoire {self.land.name}",
            },
            "subtitle": MAP_NORTH_INDICATOR,
        }
