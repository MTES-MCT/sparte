import json

from django.core.serializers import serialize

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import LEGEND_NAVIGATION_EXPORT, OCSGE_CREDITS
from public_data.models import AdminRef, LandArtifStockIndex, LandModel


class ArtifMap(DiagnosticChart):
    @property
    def lands(self):
        return LandModel.objects.filter(
            parent_land_type=self.land.land_type,
            parent_land_ids__contains=[self.land.id],
            land_type=self.params.get("child_land_type"),
        )

    @property
    def artif(self):
        return LandArtifStockIndex.objects.filter(
            land_id__in=self.lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("index"),
        ).order_by("land_id")

    @property
    def previous_artif(self):
        return LandArtifStockIndex.objects.filter(
            land_id__in=self.lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("previous_index"),
        ).order_by("land_id")

    @property
    def param(self):
        geojson = serialize(
            "geojson",
            self.lands,
            geometry_field="geom",
            fields=(
                "land_id",
                "name",
            ),
            srid=3857,
        )

        data = [
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
            for current, previous in zip(self.artif.all(), self.previous_artif.all())
        ]

        return super().param | {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": (
                    f"Artificialisation des {AdminRef.get_label(self.params.get('child_land_type')).lower()}s "
                    f"de {self.land.name} "
                )
            },
            "mapNavigation": {"enabled": False},
            "legend": {
                "title": {"text": "Taux d'artificialisation (%)"},
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
                "min": min([d["percent"] for d in data]),
                "max": max([d["percent"] for d in data]),
                "minColor": "#FFFFFF",
                "maxColor": "#6a6af4",
                "dataClassColor": "category",
            },
            "series": [
                {
                    "name": "Sols artificiels",
                    "data": data,
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
                    "name": "Flux d'artificialisation",
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
                        for d in data
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
                    "name": "Flux de désartificialisation",
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
                        for d in data
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


class ArtifMapExport(ArtifMap):
    @property
    def is_interdepartemental(self):
        return self.lands.values("departements").distinct().count() > 1

    @property
    def title_end(self):
        if self.is_interdepartemental:
            return f"au millésime n°{self.params.get('index')}"
        else:
            previous_year = self.previous_artif.first().years[0]
            year = self.artif.first().years[-1]
            return f"entre {previous_year} et {year}"

    @property
    def param(self):
        return super().param | {
            "chart": {
                **super().param["chart"],
                "height": "800px",
            },
            "credits": OCSGE_CREDITS,
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": f"{super().param['title']['text']} {self.title_end}",
            },
            "subtitle": {"text": ""},
        }
