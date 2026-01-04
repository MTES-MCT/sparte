import json

from django.core.serializers import serialize

from project.charts.base_project_chart import DiagnosticChart
from public_data.models import LandModel
from public_data.models.territorialisation import TerritorialisationObjectif


class TerritorialisationProgressMapBase(DiagnosticChart):
    """Classe de base pour les cartes de territorialisation."""

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
    def base_data(self):
        data = []
        for objectif in self.children_objectifs:
            land = objectif.land
            conso_details = land.conso_details or {}
            conso_2011_2020 = conso_details.get("conso_2011_2020", 0) or 0
            conso_since_2021 = conso_details.get("conso_since_2021", 0) or 0
            objectif_reduction = float(objectif.objectif_de_reduction)
            conso_max_2021_2030 = conso_2011_2020 * (1 - objectif_reduction / 100)
            conso_restante = max(0, conso_max_2021_2030 - conso_since_2021)

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
                    "conso_restante": round(conso_restante, 2),
                    "progress": progress,
                }
            )
        return data

    def get_geojson(self):
        return json.loads(
            serialize(
                "geojson",
                self.lands,
                geometry_field="simple_geom",
                fields=("land_id", "name"),
                srid=3857,
            )
        )


class TerritorialisationProgressMap(TerritorialisationProgressMapBase):
    """Carte de la progression de consommation par rapport aux objectifs territorialisés."""

    name = "carte de progression territorialisation"

    @property
    def data(self):
        return self.base_data

    @property
    def data_table(self):
        return {
            "headers": ["Territoire", "Conso. depuis 2021 (ha)", "Conso. max (ha)", "Progression (%)"],
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": d["name"],
                    "data": [d["name"], d["conso_since_2021"], d["conso_max_2021_2030"], f"{d['progress']}%"],
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

        data = self.data
        en_depassement = len([d for d in data if d["progress"] >= 100])

        return super().param | {
            "chart": {"map": self.get_geojson()},
            "title": {"text": "Progression vers l'objectif", "style": {"fontSize": "14px", "fontWeight": "600"}},
            "subtitle": {
                "text": f"{en_depassement} en dépassement" if en_depassement else "Tous en bonne voie",
                "style": {"fontSize": "11px", "color": "#666"},
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Consommé (%)", "style": {"fontSize": "10px", "fontWeight": "500"}},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": 0,
                "max": 100,
                "stops": [[0, "#4CAF50"], [0.5, "#FFC107"], [0.8, "#FF9800"], [1, "#F44336"]],
                "labels": {"format": "{value}%"},
            },
            "series": [
                {
                    "name": "Progression",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "progress",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Consommé : <b>{point.conso_since_2021} ha</b> / {point.conso_max_2021_2030} ha<br/>Progression : <b>{point.progress}%</b>",  # noqa: E501
                    },
                }
            ],
        }


class TerritorialisationConsoMap(TerritorialisationProgressMapBase):
    """Carte de la consommation depuis 2021 en hectares."""

    name = "carte de consommation territorialisation"

    @property
    def data(self):
        return self.base_data

    @property
    def param(self):
        if not self.has_children:
            return super().param | {
                "chart": {"map": None},
                "title": {"text": "Aucun objectif territorialisé"},
                "series": [],
            }

        data = self.data
        max_conso = max((d["conso_since_2021"] for d in data), default=1)

        return super().param | {
            "chart": {"map": self.get_geojson()},
            "title": {"text": "Consommation depuis 2021", "style": {"fontSize": "14px", "fontWeight": "600"}},
            "subtitle": {"text": "En hectares", "style": {"fontSize": "11px", "color": "#666"}},
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Hectares", "style": {"fontSize": "10px", "fontWeight": "500"}},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": 0,
                "max": max_conso,
                "stops": [[0, "#E3F2FD"], [0.5, "#2196F3"], [1, "#0D47A1"]],
                "labels": {"format": "{value} ha"},
            },
            "series": [
                {
                    "name": "Consommation",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "conso_since_2021",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Consommé depuis 2021 : <b>{point.conso_since_2021} ha</b><br/>Objectif : -{point.objectif}%",  # noqa: E501
                    },
                }
            ],
        }


class TerritorialisationObjectifMap(TerritorialisationProgressMapBase):
    """Carte des objectifs de réduction en pourcentage."""

    name = "carte des objectifs territorialisation"

    @property
    def data(self):
        return self.base_data

    @property
    def param(self):
        if not self.has_children:
            return super().param | {
                "chart": {"map": None},
                "title": {"text": "Aucun objectif territorialisé"},
                "series": [],
            }

        data = self.data
        min_obj = min((d["objectif"] for d in data), default=0)
        max_obj = max((d["objectif"] for d in data), default=100)

        return super().param | {
            "chart": {"map": self.get_geojson()},
            "title": {"text": "Objectifs de réduction", "style": {"fontSize": "14px", "fontWeight": "600"}},
            "subtitle": {
                "text": "Taux de réduction fixé par territoire",
                "style": {"fontSize": "11px", "color": "#666"},
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Réduction (%)", "style": {"fontSize": "10px", "fontWeight": "500"}},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": min_obj,
                "max": max_obj,
                "stops": [[0, "#C8E6C9"], [0.5, "#66BB6A"], [1, "#2E7D32"]],
                "labels": {"format": "-{value}%"},
            },
            "series": [
                {
                    "name": "Objectif",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "objectif",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Objectif : <b>-{point.objectif}%</b><br/>Conso. max : {point.conso_max_2021_2030} ha",  # noqa: E501
                    },
                }
            ],
        }


class TerritorialisationRestanteMap(TerritorialisationProgressMapBase):
    """Carte de la consommation restante disponible en hectares."""

    name = "carte de consommation restante territorialisation"

    @property
    def data(self):
        return self.base_data

    @property
    def param(self):
        if not self.has_children:
            return super().param | {
                "chart": {"map": None},
                "title": {"text": "Aucun objectif territorialisé"},
                "series": [],
            }

        data = self.data
        max_restante = max((d["conso_restante"] for d in data), default=1)

        return super().param | {
            "chart": {"map": self.get_geojson()},
            "title": {"text": "Consommation restante", "style": {"fontSize": "14px", "fontWeight": "600"}},
            "subtitle": {"text": "Hectares disponibles jusqu'en 2030", "style": {"fontSize": "11px", "color": "#666"}},
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Hectares", "style": {"fontSize": "10px", "fontWeight": "500"}},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": 0,
                "max": max_restante,
                "stops": [[0, "#FFEBEE"], [0.3, "#FFCDD2"], [0.6, "#81C784"], [1, "#2E7D32"]],
                "labels": {"format": "{value} ha"},
            },
            "series": [
                {
                    "name": "Restant",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "conso_restante",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Restant : <b>{point.conso_restante} ha</b><br/>Consommé : {point.conso_since_2021} ha / {point.conso_max_2021_2030} ha",  # noqa: E501
                    },
                }
            ],
        }


class TerritorialisationAnneesRestantesMap(TerritorialisationProgressMapBase):
    """Carte du nombre d'années restantes au rythme actuel avant dépassement."""

    name = "carte années restantes territorialisation"

    # Nombre d'années depuis 2021 (données jusqu'à fin 2023 = 3 ans)
    ANNEES_ECOULEES = 3
    ANNEE_FIN = 2030

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
            conso_restante = max(0, conso_max_2021_2030 - conso_since_2021)

            # Calcul du rythme annuel moyen
            rythme_annuel = conso_since_2021 / self.ANNEES_ECOULEES if self.ANNEES_ECOULEES > 0 else 0

            # Calcul des années restantes
            if rythme_annuel > 0 and conso_restante > 0:
                annees_restantes = round(conso_restante / rythme_annuel, 1)
            elif conso_restante <= 0:
                annees_restantes = 0  # Déjà en dépassement
            else:
                annees_restantes = 99  # Pas de consommation = infini (plafonné)

            data.append(
                {
                    "land_id": land.land_id,
                    "name": land.name,
                    "annees_restantes": annees_restantes,
                    "rythme_annuel": round(rythme_annuel, 2),
                    "conso_restante": round(conso_restante, 2),
                    "conso_since_2021": round(conso_since_2021, 2),
                }
            )
        return data

    @property
    def param(self):
        if not self.has_children:
            return super().param | {
                "chart": {"map": None},
                "title": {"text": "Aucun objectif territorialisé"},
                "series": [],
            }

        data = self.data
        en_depassement = len([d for d in data if d["annees_restantes"] == 0])

        return super().param | {
            "chart": {"map": self.get_geojson()},
            "title": {"text": "Années restantes", "style": {"fontSize": "14px", "fontWeight": "600"}},
            "subtitle": {
                "text": f"Au rythme actuel • {en_depassement} déjà en dépassement"
                if en_depassement
                else "Au rythme actuel de consommation",
                "style": {"fontSize": "11px", "color": "#666"},
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Années", "style": {"fontSize": "10px", "fontWeight": "500"}},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": 0,
                "max": 10,
                "stops": [[0, "#B71C1C"], [0.3, "#FF5722"], [0.6, "#FFC107"], [1, "#4CAF50"]],
                "labels": {"format": "{value} ans"},
            },
            "series": [
                {
                    "name": "Années restantes",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "annees_restantes",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Années restantes : <b>{point.annees_restantes} ans</b><br/>Rythme actuel : {point.rythme_annuel} ha/an<br/>Restant : {point.conso_restante} ha",  # noqa: E501
                    },
                }
            ],
        }


class TerritorialisationEffortMap(TerritorialisationProgressMapBase):
    """Carte de l'effort de réduction requis pour respecter l'objectif."""

    name = "carte effort territorialisation"

    ANNEES_ECOULEES = 3
    ANNEES_RESTANTES_PERIODE = 7  # 2024-2030

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
            conso_restante = max(0, conso_max_2021_2030 - conso_since_2021)

            # Rythme actuel
            rythme_actuel = conso_since_2021 / self.ANNEES_ECOULEES if self.ANNEES_ECOULEES > 0 else 0

            # Rythme nécessaire pour rester dans l'objectif
            rythme_necessaire = (
                conso_restante / self.ANNEES_RESTANTES_PERIODE if self.ANNEES_RESTANTES_PERIODE > 0 else 0
            )

            # Effort = réduction nécessaire du rythme (en %)
            if rythme_actuel > 0:
                if rythme_necessaire >= rythme_actuel:
                    effort = 0  # Pas besoin de réduire
                else:
                    effort = round(((rythme_actuel - rythme_necessaire) / rythme_actuel) * 100, 1)
            else:
                effort = 0

            # Plafonner l'effort à 100%
            effort = min(effort, 100)

            data.append(
                {
                    "land_id": land.land_id,
                    "name": land.name,
                    "effort": effort,
                    "rythme_actuel": round(rythme_actuel, 2),
                    "rythme_necessaire": round(rythme_necessaire, 2),
                    "conso_restante": round(conso_restante, 2),
                }
            )
        return data

    @property
    def param(self):
        if not self.has_children:
            return super().param | {
                "chart": {"map": None},
                "title": {"text": "Aucun objectif territorialisé"},
                "series": [],
            }

        data = self.data
        effort_eleve = len([d for d in data if d["effort"] >= 50])

        return super().param | {
            "chart": {"map": self.get_geojson()},
            "title": {"text": "Effort de réduction requis", "style": {"fontSize": "14px", "fontWeight": "600"}},
            "subtitle": {
                "text": f"{effort_eleve} territoires doivent réduire de +50%"
                if effort_eleve
                else "Réduction du rythme nécessaire",
                "style": {"fontSize": "11px", "color": "#666"},
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Réduction (%)", "style": {"fontSize": "10px", "fontWeight": "500"}},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": 0,
                "max": 100,
                "stops": [[0, "#E8F5E9"], [0.3, "#FFF3E0"], [0.6, "#FFCCBC"], [1, "#C62828"]],
                "labels": {"format": "-{value}%"},
            },
            "series": [
                {
                    "name": "Effort",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "effort",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Effort requis : <b>-{point.effort}%</b><br/>Rythme actuel : {point.rythme_actuel} ha/an<br/>Rythme nécessaire : {point.rythme_necessaire} ha/an",  # noqa: E501
                    },
                }
            ],
        }


class TerritorialisationRythmeMap(TerritorialisationProgressMapBase):
    """Carte du rythme de consommation annuel moyen depuis 2021."""

    name = "carte rythme territorialisation"

    ANNEES_ECOULEES = 3

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

            # Rythmes
            rythme_actuel = conso_since_2021 / self.ANNEES_ECOULEES if self.ANNEES_ECOULEES > 0 else 0
            rythme_autorise = conso_max_2021_2030 / 10  # Sur 10 ans

            # Écart en %
            if rythme_autorise > 0:
                ecart_rythme = round(((rythme_actuel - rythme_autorise) / rythme_autorise) * 100, 1)
            else:
                ecart_rythme = 100 if rythme_actuel > 0 else 0

            data.append(
                {
                    "land_id": land.land_id,
                    "name": land.name,
                    "rythme_actuel": round(rythme_actuel, 2),
                    "rythme_autorise": round(rythme_autorise, 2),
                    "ecart_rythme": ecart_rythme,
                }
            )
        return data

    @property
    def param(self):
        if not self.has_children:
            return super().param | {
                "chart": {"map": None},
                "title": {"text": "Aucun objectif territorialisé"},
                "series": [],
            }

        data = self.data
        au_dessus = len([d for d in data if d["ecart_rythme"] > 0])

        return super().param | {
            "chart": {"map": self.get_geojson()},
            "title": {"text": "Écart au rythme autorisé", "style": {"fontSize": "14px", "fontWeight": "600"}},
            "subtitle": {
                "text": f"{au_dessus} territoires au-dessus du rythme"
                if au_dessus
                else "Tous sous le rythme autorisé",
                "style": {"fontSize": "11px", "color": "#666"},
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Écart (%)", "style": {"fontSize": "10px", "fontWeight": "500"}},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": -50,
                "max": 100,
                "stops": [[0, "#1B5E20"], [0.33, "#81C784"], [0.5, "#FFF9C4"], [0.75, "#FF8A65"], [1, "#B71C1C"]],
                "labels": {"format": "{value}%"},
            },
            "series": [
                {
                    "name": "Écart",
                    "data": data,
                    "joinBy": ["land_id"],
                    "colorKey": "ecart_rythme",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#888888",
                    "borderWidth": 1,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": "<b>{point.name}</b><br/>Écart : <b>{point.ecart_rythme}%</b><br/>Rythme actuel : {point.rythme_actuel} ha/an<br/>Rythme autorisé : {point.rythme_autorise} ha/an",  # noqa: E501
                    },
                }
            ],
        }
