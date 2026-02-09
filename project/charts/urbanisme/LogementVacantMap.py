import json

from django.core.serializers import serialize
from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    LOGEMENT_VACANT_COLOR_GENERAL,
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.models import AdminRef, LandModel
from public_data.models.urbanisme import LogementVacant


class LogementVacantMapBase(DiagnosticChart):
    required_params = ["child_land_type", "end_date"]

    @property
    def lands(self):
        return LandModel.objects.filter(
            parent_keys__contains=[self.land.key],
            land_type=self.params.get("child_land_type"),
        )

    @property
    def formatted_child_land_type(self):
        child_land_type = self.params.get("child_land_type")
        if child_land_type in [AdminRef.SCOT, AdminRef.EPCI]:
            return AdminRef.get_label(child_land_type)
        return AdminRef.get_label(child_land_type).lower()

    @cached_property
    def actual_year(self):
        end_date = int(self.params.get("end_date"))
        child_land_ids = list(self.lands.values_list("land_id", flat=True))
        child_land_type = self.params.get("child_land_type")

        available_year = (
            LogementVacant.objects.filter(
                land_id__in=child_land_ids,
                land_type=child_land_type,
                year__lte=end_date,
            )
            .order_by("-year")
            .values_list("year", flat=True)
            .first()
        )

        return available_year or end_date

    @cached_property
    def logement_vacant_data(self):
        child_land_ids = list(self.lands.values_list("land_id", flat=True))
        child_land_type = self.params.get("child_land_type")

        lv_qs = LogementVacant.objects.filter(
            land_id__in=child_land_ids,
            land_type=child_land_type,
            year=self.actual_year,
        )

        lv_dict = {lv.land_id: lv for lv in lv_qs}

        return [
            {
                "land_id": land.land_id,
                "logements_vacants_parc_general": lv.logements_vacants_parc_general,
                "logements_vacants_parc_general_percent": lv.logements_vacants_parc_general_percent,
                "logements_vacants_parc_prive": lv.logements_vacants_parc_prive,
                "logements_vacants_parc_social": lv.logements_vacants_parc_social,
                "secretise": land.logements_vacants_status == LandModel.LogementsVacantsStatus.DONNEES_INDISPONIBLES,
            }
            for land in self.lands
            if (lv := lv_dict.get(land.land_id))
        ]

    @property
    def data_table(self):
        headers = [
            AdminRef.get_label(self.params.get("child_land_type")),
            f"Taux de vacance structurelle (%) - {self.actual_year}",
            f"Total logements en vacance structurelle - {self.actual_year}",
            "Logements vacants parc privé",
            "Logements vacants parc social",
        ]

        return {
            "headers": headers,
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": str(self.logement_vacant_data),
                    "data": [
                        self.lands.get(land_id=d["land_id"]).name,
                        round(d["logements_vacants_parc_general_percent"], 2)
                        if d["logements_vacants_parc_general_percent"] is not None
                        else None,
                        d["logements_vacants_parc_general"],
                        d["logements_vacants_parc_prive"],
                        d["logements_vacants_parc_social"],
                    ],
                }
                for d in self.logement_vacant_data
                if not d["secretise"]
            ],
        }


class LogementVacantMapPercent(LogementVacantMapBase):
    @property
    def name(self):
        return f"logement vacant map percent {self.actual_year}"

    @property
    def param(self):
        geojson = json.loads(
            serialize(
                "geojson",
                self.lands,
                geometry_field="simple_geom",
                fields=(
                    "land_id",
                    "name",
                ),
                srid=3857,
            )
        )

        # Données avec pourcentage valide (non secrétisées et pourcentage non null)
        data_with_values = [
            d
            for d in self.logement_vacant_data
            if not d["secretise"] and d["logements_vacants_parc_general_percent"] is not None
        ]
        # Données avec pourcentage manquant (non secrétisées mais pourcentage null)
        data_missing_percent = [
            d
            for d in self.logement_vacant_data
            if not d["secretise"] and d["logements_vacants_parc_general_percent"] is None
        ]
        percent_values = [d["logements_vacants_parc_general_percent"] for d in data_with_values]

        base_param = {
            "chart": {
                "map": geojson,
            },
            "title": {
                "text": (
                    f"Taux de vacance structurelle des {self.formatted_child_land_type}s " f"en {self.actual_year}"
                )
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Taux de vacance structurelle (%)"},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "colorAxis": {
                "min": min(percent_values) if percent_values else 0,
                "max": max(percent_values) if percent_values else 1,
                "minColor": "#FFFFFF",
                "maxColor": LOGEMENT_VACANT_COLOR_GENERAL,
                "dataClassColor": "category",
            },
            "series": [
                {
                    "name": "Taux de vacance structurelle",
                    "data": data_with_values,
                    "joinBy": ["land_id"],
                    "allAreas": False,
                    "colorKey": "logements_vacants_parc_general_percent",
                    "opacity": 1,
                    "showInLegend": False,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "dataLabels": {
                        "enabled": False,
                    },
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>"
                            "Taux de vacance structurelle: {point.logements_vacants_parc_general_percent:,.2f} %<br/>"
                            "Total: {point.logements_vacants_parc_general:,.0f}<br/>"
                            "Parc privé: {point.logements_vacants_parc_prive:,.0f}<br/>"
                            "Parc social: {point.logements_vacants_parc_social:,.0f}"
                        ),
                    },
                },
                {
                    "name": "Données indisponibles",
                    "data": [{**d, "color": "#e8e8e8"} for d in self.logement_vacant_data if d["secretise"]]
                    + [{**d, "color": "#e8e8e8"} for d in data_missing_percent],
                    "joinBy": ["land_id"],
                    "allAreas": False,
                    "color": "#e8e8e8",
                    "opacity": 1,
                    "showInLegend": True,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "tooltip": {
                        "pointFormat": ("<b>{point.name}</b>:<br/>" "Données indisponibles"),
                    },
                },
            ],
        }

        return DiagnosticChart.param.fget(self) | base_param


class LogementVacantMapAbsolute(LogementVacantMapBase):
    @property
    def name(self):
        return f"logement vacant map absolute {self.actual_year}"

    @property
    def param(self):
        geojson = json.loads(
            serialize(
                "geojson",
                self.lands,
                geometry_field="simple_geom",
                fields=("land_id", "name"),
                srid=3857,
            )
        )

        data_with_values = [
            d
            for d in self.logement_vacant_data
            if not d["secretise"] and d["logements_vacants_parc_general"] is not None
        ]
        data_unavailable = [
            d for d in self.logement_vacant_data if d["secretise"] or d["logements_vacants_parc_general"] is None
        ]

        base_param = {
            "chart": {"map": geojson},
            "title": {
                "text": (
                    f"Nombre de logements en vacance structurelle des {self.formatted_child_land_type}s "
                    f"en {self.actual_year}"
                )
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
            },
            "series": [
                {
                    "name": "Territoires",
                    "data": [{"land_id": d["land_id"], "id": d["land_id"]} for d in data_with_values],
                    "joinBy": ["land_id"],
                    "color": "transparent",
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "showInLegend": False,
                    "enableMouseTracking": False,
                },
                {
                    "name": "Données indisponibles",
                    "data": [{"land_id": d["land_id"], "color": "#e8e8e8"} for d in data_unavailable],
                    "joinBy": ["land_id"],
                    "allAreas": False,
                    "color": "#e8e8e8",
                    "showInLegend": True,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "tooltip": {"pointFormat": "<b>{point.name}</b>:<br/>Données indisponibles"},
                },
                {
                    "type": "mapbubble",
                    "name": "Parc privé",
                    "data": [],
                    "color": LOGEMENT_VACANT_COLOR_PRIVE,
                    "showInLegend": True,
                },
                {
                    "type": "mapbubble",
                    "name": "Parc social",
                    "data": [],
                    "color": LOGEMENT_VACANT_COLOR_SOCIAL,
                    "showInLegend": True,
                },
            ],
            "_pieSeries": [
                {
                    "type": "pie",
                    "name": self.lands.get(land_id=d["land_id"]).name,
                    "zIndex": 6,
                    "size": 25,
                    "onPoint": {
                        "id": d["land_id"],
                        "z": d["logements_vacants_parc_general"],
                    },
                    "data": [
                        {
                            "name": "Parc privé",
                            "y": d["logements_vacants_parc_prive"] or 0,
                            "color": LOGEMENT_VACANT_COLOR_PRIVE,
                        },
                        {
                            "name": "Parc social",
                            "y": d["logements_vacants_parc_social"] or 0,
                            "color": LOGEMENT_VACANT_COLOR_SOCIAL,
                        },
                    ],
                    "showInLegend": False,
                    "dataLabels": {"enabled": False},
                    "tooltip": {
                        "headerFormat": (
                            f"<b>{self.lands.get(land_id=d['land_id']).name}</b><br/>"
                            f"Total: {d['logements_vacants_parc_general']:,}<br/>"
                        ),
                        "pointFormat": (
                            '<span style="color:{point.color}">●</span> '
                            "{point.name}: <b>{point.y:,.0f}</b> ({point.percentage:.1f}%)"
                        ),
                    },
                }
                for d in data_with_values
                if d["logements_vacants_parc_general"] and d["logements_vacants_parc_general"] > 0
            ],
        }

        return DiagnosticChart.param.fget(self) | base_param
