import json

from django.core.serializers import serialize

from project.charts.base_project_chart import DiagnosticChart
from public_data.models import LandModel
from public_data.models.territorialisation import TerritorialisationObjectif


class TerritorialisationMap(DiagnosticChart):
    """
    Carte thématique des objectifs de territorialisation des enfants.
    """

    name = "carte de territorialisation"

    @property
    def children_objectifs(self):
        """
        Récupère tous les objectifs où le territoire actuel est le parent.
        """
        return TerritorialisationObjectif.objects.filter(
            parent__land_id=self.land.land_id,
            parent__land_type=self.land.land_type,
        ).select_related("land")

    @property
    def has_children(self):
        return self.children_objectifs.exists()

    @property
    def lands(self):
        """Retourne les territoires enfants qui ont un objectif."""
        return LandModel.objects.filter(pk__in=self.children_objectifs.values_list("land__pk", flat=True))

    @property
    def data(self):
        """
        Transforme les objectifs en format utilisable par la carte.
        Inclut les données de consommation de chaque territoire.
        """
        data = []
        for objectif in self.children_objectifs:
            land = objectif.land
            conso_details = land.conso_details or {}
            conso_2011_2020 = conso_details.get("conso_2011_2020", 0) or 0
            conso_since_2021 = conso_details.get("conso_since_2021", 0) or 0
            objectif_reduction = float(objectif.objectif_de_reduction)
            conso_max_2021_2030 = round(conso_2011_2020 * (1 - objectif_reduction / 100), 2)

            data.append(
                {
                    "land_id": land.land_id,
                    "name": land.name,
                    "objectif": objectif_reduction,
                    "nom_document": objectif.nom_document,
                    "conso_2011_2020": round(conso_2011_2020, 2),
                    "conso_since_2021": round(conso_since_2021, 2),
                    "conso_max_2021_2030": conso_max_2021_2030,
                }
            )
        return data

    @property
    def data_table(self):
        headers = [
            "Territoire",
            "Objectif (%)",
            "Conso. 2011-2020 (ha)",
            "Conso. depuis 2021 (ha)",
            "Conso. max 2021-2030 (ha)",
            "Document",
        ]

        return {
            "headers": headers,
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": d["name"],
                    "data": [
                        d["name"],
                        f"-{d['objectif']}%",
                        d["conso_2011_2020"],
                        d["conso_since_2021"],
                        d["conso_max_2021_2030"],
                        d["nom_document"],
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
            fields=(
                "land_id",
                "name",
            ),
            srid=3857,
        )

        data_with_values = self.data

        min_val = min([d["objectif"] for d in data_with_values]) if data_with_values else 0
        max_val = max([d["objectif"] for d in data_with_values]) if data_with_values else 100

        nb_territoires = len(data_with_values)

        if min_val == max_val:
            objectif_text = f"Objectif uniforme de -{min_val}%"
        else:
            objectif_text = f"Objectifs de -{min_val}% à -{max_val}%"

        return super().param | {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": f"Objectifs des membres de {self.land.name}",
                "style": {"fontSize": "16px", "fontWeight": "600"},
            },
            "subtitle": {
                "text": f"{nb_territoires} membre{'s' if nb_territoires > 1 else ''} · {objectif_text}",
                "style": {"fontSize": "12px", "color": "#666"},
            },
            "caption": {
                "text": "Réduction de la consommation d'espaces NAF 2021-2031 vs 2011-2021",
                "style": {"fontSize": "10px", "color": "#888"},
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {
                    "text": "Réduction (%)",
                    "style": {"fontSize": "11px", "fontWeight": "500"},
                },
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": min_val,
                "max": max_val,
                "minColor": "#f0e6f0",
                "maxColor": "#A558A0",
                "labels": {
                    "format": "{value}%",
                },
            },
            "series": [
                {
                    "name": "Objectif de réduction",
                    "data": data_with_values,
                    "joinBy": ["land_id"],
                    "colorKey": "objectif",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {
                        "enabled": False,
                    },
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Objectif : <b style='color: #A558A0;'>-{point.objectif}%</b>",  # noqa
                    },
                },
            ],
        }
