import json

from django.core.serializers import serialize

from project.charts.base_project_chart import DiagnosticChart
from public_data.models import LandArtifStockIndex, LandModel


class ArtifMap(DiagnosticChart):
    @property
    def param(self):
        lands = LandModel.objects.filter(
            parent_land_type=self.land.land_type,
            parent_land_ids__contains=[self.land.id],
            land_type=self.params.get("child_land_type"),
        )

        queryset = LandArtifStockIndex.objects.filter(
            land_id__in=lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("index"),
        )

        raw_years = queryset.values_list("years", flat=True).distinct()

        years = set()

        for _years in raw_years:
            for year in _years:
                years.add(year)

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
                "land_id": d.land_id,
                "percent": d.percent,
                "surface": d.surface,
                "flux_percent": d.flux_percent,
                "flux_surface": d.flux_surface,
                "years": d.years,
                "flux_previous_years": d.flux_previous_years,
                "years_str": ", ".join(map(str, d.years)),
                "flux_previous_years_str": ", ".join(map(str, d.flux_previous_years)),
            }
            for d in queryset.all()
        ]

        return super().param | {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": (
                    f"Artificialisation des {self.params.get('child_land_type')} "
                    f"entre x et {', '.join(map(str, years))}"
                )
            },
            "mapNavigation": {"enabled": False, "buttonOptions": {"verticalAlign": "bottom"}},
            "colorAxis": {
                "min": min([d["percent"] for d in data]),
                "max": max([d["percent"] for d in data]),
                "minColor": "#FFFFFF",
                "maxColor": "#FF0000",
                "dataClassColor": "category",
            },
            "series": [
                {
                    "name": "",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "percent",
                    "enableMouseTracking": False,
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.name}",
                    },
                },
                {
                    "name": "Evolution",
                    "type": "mapbubble",
                    "joinBy": ["land_id"],
                    "maxSize": 50,
                    "data": [
                        {
                            "land_id": d["land_id"],
                            "z": d["flux_surface"] / 10000,
                            "color": "#ff8000" if d["flux_surface"] else "#008000",
                            "prefix_value": "+" if d["flux_surface"] > 0 else "-",
                            "flux_surface": d["flux_surface"] / 10000,
                            "flux_percent": d["flux_percent"],
                            "years": d["years_str"],
                            "flux_previous_years": d["flux_previous_years_str"],
                        }
                        for d in data
                    ],
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>"
                            "{point.prefix_value}{point.flux_surface:,.1f} ha "
                            "({point.prefix_value}{point.flux_percent:,.2f} %) "
                            "<small>depuis {point.flux_previous_years}</small>"
                        ),
                    },
                },
            ],
        }
