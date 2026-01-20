import json

from django.core.serializers import serialize

from project.charts.base_project_chart import DiagnosticChart
from public_data.models import LandModel
from public_data.models.administration import AdminRef
from public_data.models.territorialisation import TerritorialisationObjectif


class TerritorialisationMap(DiagnosticChart):
    """
    Carte thématique des objectifs de territorialisation des enfants.
    """

    name = "carte de territorialisation"

    PLURAL_LABELS = {
        AdminRef.COMMUNE: "Communes",
        AdminRef.EPCI: "EPCIs",
        AdminRef.SCOT: "SCoTs",
        AdminRef.DEPARTEMENT: "Départements",
        AdminRef.REGION: "Régions",
    }

    def get_children_land_types_label(self):
        """Retourne les types de territoires enfants formatés (ex: 'SCoTs et EPCIs')."""
        land_types = list(
            set(obj.land.land_type for obj in self.children_objectifs if obj.land.land_type != AdminRef.CUSTOM)
        )
        labels = [self.PLURAL_LABELS.get(lt, AdminRef.get_label(lt)) for lt in land_types]
        if len(labels) == 0:
            return ""
        if len(labels) == 1:
            return labels[0]
        return " et ".join([", ".join(labels[:-1]), labels[-1]])

    def get_document_name(self):
        """Retourne le nom du document du territoire parent."""
        objectif = self.land.territorialisation_objectifs.first()
        if objectif:
            return objectif.nom_document
        return ""

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

        return super().param | {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": f"Objectifs de réduction de la consommation d'espaces NAF des {self.get_children_land_types_label()} territorialisés dans le {self.get_document_name()} de {self.land.name}",  # noqa
                "style": {"fontSize": "16px", "fontWeight": "600"},
            },
            "subtitle": {
                "text": "Réduction pour la période 2021-2031 par rapport à la période 2011-2020",
                "style": {"fontSize": "12px", "color": "#666"},
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
