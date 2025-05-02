import json

from django.core.serializers import serialize

from project.charts.base_project_chart import DiagnosticChart
from public_data.models import AdminRef, LandArtifStockIndex, LandModel


class ArtifMap(DiagnosticChart):
    @property
    def param(self):
        lands = LandModel.objects.filter(
            parent_land_type=self.land.land_type,
            parent_land_ids__contains=[self.land.id],
            land_type=self.params.get("child_land_type"),
        )

        artif = LandArtifStockIndex.objects.filter(
            land_id__in=lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("index"),
        ).order_by("land_id")

        previous_artif = LandArtifStockIndex.objects.filter(
            land_id__in=lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("previous_index"),
        ).order_by("land_id")

        geojson = serialize(
            "geojson",
            lands,
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
            for current, previous in zip(artif.all(), previous_artif.all())
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
                "title": {"text": "Taux d'artificialisation (%)", "style": {"fontWeight": "bold"}},
                "backgroundColor": "#ffffff",
                "bubbleLegend": {
                    "enabled": True,
                    "borderWidth": 1,
                    "legendIndex": 100,
                    "labels": {"format": "{value:.0f} ha"},
                    "color": "transparent",
                    "connectorDistance": 40,
                },
            },
            "colorAxis": {
                "min": min([d["percent"] for d in data]),
                "max": max([d["percent"] for d in data]),
                "minColor": "#FFFFFF",
                "maxColor": "#FF0000",
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
                    "name": "Flux d'artificialisation (ha)",
                    "type": "mapbubble",
                    "joinBy": ["land_id"],
                    "showInLegend": True,
                    "maxSize": 50,
                    "marker": {
                        "fillOpacity": 0.5,
                    },
                    "color": "#9400D3",
                    "data": [
                        {
                            "land_id": d["land_id"],
                            "z": d["flux_surface"],
                            "color": "#9400D3" if d["flux_surface"] > 0 else "#008000",
                            "prefix_value": "+" if d["flux_surface"] > 0 else "",
                            "flux_surface": d["flux_surface"],
                            "flux_percent": d["flux_percent"],
                            "years": d["years_str"],
                            "previous_years": d["previous_years_str"],
                        }
                        for d in data
                    ],
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>"
                            "{point.prefix_value}{point.flux_surface:,.1f} ha "
                            "({point.prefix_value}{point.flux_percent:,.2f} %) "
                        ),
                    },
                },
            ],
        }
