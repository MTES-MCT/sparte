import json

from django.core.serializers import serialize

from project.charts.base_project_chart import DiagnosticChart
from public_data.models import LandModel
from public_data.models.territorialisation import TerritorialisationObjectif


class TerritorialisationProgressMap(DiagnosticChart):
    """
    Carte de la progression de consommation par rapport aux objectifs territorialisés.
    """

    name = "carte de progression territorialisation"

    @property
    def children_objectifs(self):
        return TerritorialisationObjectif.objects.filter(
            parent__land_id=self.land.land_id,
            parent__land_type=self.land.land_type,
        ).select_related("land")

    @property
    def has_children(self):
        return self.children_objectifs.exists()

    @property
    def lands(self):
        return LandModel.objects.filter(pk__in=self.children_objectifs.values_list("land__pk", flat=True))

    @property
    def data(self):
        data = []
        for objectif in self.children_objectifs:
            land = objectif.land
            conso_details = land.conso_details or {}
            conso_2011_2020 = conso_details.get("conso_2011_2020", 0) or 0
            conso_since_2021 = conso_details.get("conso_since_2021", 0) or 0
            objectif_reduction = float(objectif.objectif_de_reduction)
            conso_max_2021_2030 = conso_2011_2020 * (1 - objectif_reduction / 100)

            if conso_max_2021_2030 > 0:
                progress = round((conso_since_2021 / conso_max_2021_2030) * 100, 1)
            else:
                progress = 100 if conso_since_2021 > 0 else 0

            data.append(
                {
                    "land_id": land.land_id,
                    "name": land.name,
                    "objectif": objectif_reduction,
                    "conso_since_2021": round(conso_since_2021, 2),
                    "conso_max_2021_2030": round(conso_max_2021_2030, 2),
                    "progress": progress,
                }
            )
        return data

    @property
    def data_table(self):
        headers = [
            "Territoire",
            "Conso. depuis 2021 (ha)",
            "Conso. max (ha)",
            "Progression (%)",
        ]

        return {
            "headers": headers,
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": d["name"],
                    "data": [
                        d["name"],
                        d["conso_since_2021"],
                        d["conso_max_2021_2030"],
                        f"{d['progress']}%",
                    ],
                }
                for d in self.data
            ],
        }

    @property
    def param(self):
        if not self.has_children:
            return super().param | {
                "chart": {"map": None},
                "title": {"text": "Aucun objectif territorialisé"},
                "series": [],
            }

        geojson = serialize(
            "geojson",
            self.lands,
            geometry_field="simple_geom",
            fields=("land_id", "name"),
            srid=3857,
        )

        data_with_values = self.data
        nb_territoires = len(data_with_values)
        en_depassement = len([d for d in data_with_values if d["progress"] >= 100])

        return super().param | {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": f"Avancement des membres de {self.land.name}",
                "style": {"fontSize": "16px", "fontWeight": "600"},
            },
            "subtitle": {
                "text": f"{nb_territoires} membre{'s' if nb_territoires > 1 else ''} · {en_depassement} en dépassement"  # noqa
                if en_depassement
                else f"{nb_territoires} membre{'s' if nb_territoires > 1 else ''}",
                "style": {"fontSize": "12px", "color": "#666"},
            },
            "caption": {
                "text": "Pourcentage de l'enveloppe 2021-2030 déjà consommé",
                "style": {"fontSize": "10px", "color": "#888"},
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {
                    "text": "Consommé (%)",
                    "style": {"fontSize": "11px", "fontWeight": "500"},
                },
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": 0,
                "max": 100,
                "stops": [
                    [0, "#4CAF50"],
                    [0.5, "#FFC107"],
                    [0.8, "#FF9800"],
                    [1, "#F44336"],
                ],
                "labels": {
                    "format": "{value}%",
                },
            },
            "series": [
                {
                    "name": "Progression",
                    "data": data_with_values,
                    "joinBy": ["land_id"],
                    "colorKey": "progress",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {
                        "enabled": False,
                    },
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Consommé : <b>{point.conso_since_2021} ha</b> / {point.conso_max_2021_2030} ha<br/>Progression : <b>{point.progress}%</b>",  # noqa
                    },
                },
            ],
        }
