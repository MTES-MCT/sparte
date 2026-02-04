import json

from django.core.serializers import serialize
from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import LOGEMENT_VACANT_COLOR_GENERAL
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

        data_with_values = [d for d in self.logement_vacant_data if not d["secretise"]]
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
                "min": min(filter(lambda x: x is not None, percent_values)) if percent_values else 0,
                "max": max(filter(lambda x: x is not None, percent_values)) if percent_values else 1,
                "minColor": "#FFFFFF",
                "maxColor": LOGEMENT_VACANT_COLOR_GENERAL,
                "dataClassColor": "category",
            },
            "series": [
                {
                    "name": "Taux de vacance structurelle",
                    "data": [d for d in self.logement_vacant_data if not d["secretise"]],
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
                    "name": "Données secrétisées",
                    "data": [{**d, "color": "#e8e8e8"} for d in self.logement_vacant_data if d["secretise"]],
                    "joinBy": ["land_id"],
                    "allAreas": False,
                    "color": "#e8e8e8",
                    "opacity": 1,
                    "showInLegend": True,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "tooltip": {
                        "pointFormat": ("<b>{point.name}</b>:<br/>" "Données secrétisées"),
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

        base_param = {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": (
                    f"Nombre de logements en vacance structurelle des {self.formatted_child_land_type}s "
                    f"en {self.actual_year}"
                )
            },
            "mapNavigation": {"enabled": True},
            "legend": {
                "title": {"text": "Logements en vacance structurelle"},
                "backgroundColor": "#ffffff",
                "align": "right",
                "verticalAlign": "middle",
                "layout": "vertical",
                "bubbleLegend": {
                    "enabled": True,
                    "borderWidth": 1,
                    "legendIndex": 100,
                    "labels": {"format": "{value:.0f}"},
                    "color": "transparent",
                    "borderColor": "#000",
                    "connectorDistance": 40,
                    "connectorColor": "#000",
                },
            },
            "series": [
                {
                    "name": "Territoires",
                    "data": self.logement_vacant_data,
                    "joinBy": ["land_id"],
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "color": "transparent",
                    "showInLegend": False,
                    "dataLabels": {
                        "enabled": False,
                    },
                    "tooltip": {
                        "enabled": False,
                    },
                    "enableMouseTracking": False,
                },
                {
                    "name": "Logements en vacance structurelle",
                    "type": "mapbubble",
                    "joinBy": ["land_id"],
                    "showInLegend": True,
                    "maxSize": "8%",
                    "marker": {
                        "fillOpacity": 0.5,
                    },
                    "color": LOGEMENT_VACANT_COLOR_GENERAL,
                    "data": [
                        {
                            "land_id": d["land_id"],
                            "z": d["logements_vacants_parc_general"],
                            "color": LOGEMENT_VACANT_COLOR_GENERAL,
                            "logements_vacants_parc_general": d["logements_vacants_parc_general"],
                            "logements_vacants_parc_prive": d["logements_vacants_parc_prive"],
                            "logements_vacants_parc_social": d["logements_vacants_parc_social"],
                        }
                        for d in self.logement_vacant_data
                        if not d["secretise"]
                    ],
                    "tooltip": {
                        "valueDecimals": 0,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>"
                            "Total: {point.logements_vacants_parc_general:,.0f}<br/>"
                            "Parc privé: {point.logements_vacants_parc_prive:,.0f}<br/>"
                            "Parc social: {point.logements_vacants_parc_social:,.0f}"
                        ),
                    },
                },
                {
                    "name": "Données secrétisées",
                    "data": [{**d, "color": "#e8e8e8"} for d in self.logement_vacant_data if d["secretise"]],
                    "joinBy": ["land_id"],
                    "allAreas": False,
                    "color": "#e8e8e8",
                    "opacity": 1,
                    "showInLegend": True,
                    "borderColor": "#999999",
                    "borderWidth": 1,
                    "tooltip": {
                        "pointFormat": ("<b>{point.name}</b>:<br/>" "Données secrétisées"),
                    },
                },
            ],
        }

        return DiagnosticChart.param.fget(self) | base_param
