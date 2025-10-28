import json

from django.core.serializers import serialize
from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import LEGEND_NAVIGATION_EXPORT
from public_data.models import AdminRef, LandConsoStats, LandModel


class ConsoMap(DiagnosticChart):
    def __init__(self, land, params):
        """
        Initialise la carte de consommation d'espaces.

        Args:
            land: Instance de LandModel représentant le territoire
            params: Dictionnaire de paramètres devant contenir 'child_land_type', 'start_date', et 'end_date'

        Raises:
            ValueError: Si les paramètres requis ne sont pas présents
        """
        if "child_land_type" not in params:
            raise ValueError("Le paramètre 'child_land_type' est obligatoire")

        if "start_date" not in params:
            raise ValueError("Le paramètre 'start_date' est obligatoire")

        if "end_date" not in params:
            raise ValueError("Le paramètre 'end_date' est obligatoire")

        super().__init__(land=land, params=params)

    @property
    def lands(self):
        return LandModel.objects.filter(
            parent_keys__contains=[f"{self.land.land_type}_{self.land.land_id}"],
            land_type=self.params.get("child_land_type"),
        )

    @property
    def start_year(self):
        return int(self.params.get("start_date"))

    @property
    def end_year(self):
        return int(self.params.get("end_date"))

    @cached_property
    def conso_data(self):
        """
        Récupère les données de consommation par territoire pour la période donnée.
        Utilise LandConsoStats qui contient déjà les totaux par période.
        """
        child_land_ids = list(self.lands.values_list("land_id", flat=True))

        # Get all stats in one query
        stats_list = LandConsoStats.objects.filter(
            land_id__in=child_land_ids,
            land_type=self.params.get("child_land_type"),
            from_year=self.start_year,
            to_year=self.end_year,
        ).order_by("land_id")

        # Build a mapping: one stat per land_id (take first if multiple)
        stats_dict = {}
        for stats in stats_list:
            if stats.land_id not in stats_dict:
                stats_dict[stats.land_id] = stats

        return stats_dict

    @cached_property
    def data(self):
        """
        Transforme les données de consommation en format utilisable par la carte.
        Les surfaces sont déjà en m² dans LandConsoStats, on les convertit en ha.
        Calcule aussi la densité de consommation (ha consommés / ha de surface totale).
        """
        data = []
        for land_id, stats in self.conso_data.items():
            # Get the land object to access its surface
            land = self.lands.get(land_id=land_id)

            # Convert m² to ha (divide by 10000)
            total_conso_ha = (stats.total or 0) / 10000

            # Calculate density: consumption (ha) / territory surface (ha)
            # Multiply by 100 to get percentage
            conso_density_percent = (total_conso_ha / land.surface * 100) if land.surface > 0 else 0

            data.append(
                {
                    "land_id": land_id,
                    "total_conso_ha": total_conso_ha,
                    "conso_density_percent": conso_density_percent,
                    "activite_ha": (stats.activite or 0) / 10000,
                    "habitat_ha": (stats.habitat or 0) / 10000,
                    "mixte_ha": (stats.mixte or 0) / 10000,
                    "route_ha": (stats.route or 0) / 10000,
                    "ferroviaire_ha": (stats.ferroviaire or 0) / 10000,
                    "inconnu_ha": (stats.inconnu or 0) / 10000,
                }
            )

        return data

    @property
    def data_table(self):
        headers = [
            AdminRef.get_label(self.params.get("child_land_type")),
            f"Densité de consommation (%) - {self.start_year} à {self.end_year}",
            f"Consommation totale (ha) - {self.start_year} à {self.end_year}",
            "Habitat (ha)",
            "Activité (ha)",
            "Mixte (ha)",
            "Route (ha)",
            "Ferroviaire (ha)",
            "Inconnu (ha)",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [
                        self.lands.get(land_id=d["land_id"]).name,
                        round(d["conso_density_percent"], 2),
                        round(d["total_conso_ha"], 2),
                        round(d["habitat_ha"], 2),
                        round(d["activite_ha"], 2),
                        round(d["mixte_ha"], 2),
                        round(d["route_ha"], 2),
                        round(d["ferroviaire_ha"], 2),
                        round(d["inconnu_ha"], 2),
                    ],
                }
                for d in self.data
            ],
        }

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

        # Filter out territories with no data
        data_with_values = [d for d in self.data if d["total_conso_ha"] > 0]

        return super().param | {
            "chart": {
                "map": json.loads(geojson),
            },
            "title": {
                "text": (
                    f"Consommation d'espaces NAF des {self.formatted_child_land_type}s "
                    f"entre {self.start_year} et {self.end_year}"
                )
            },
            "mapNavigation": {"enabled": self.lands.count() > 20},
            "legend": {
                "title": {"text": "Densité de consommation (%)"},
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
                "min": min([d["conso_density_percent"] for d in data_with_values]) if data_with_values else 0,
                "max": max([d["conso_density_percent"] for d in data_with_values]) if data_with_values else 1,
                "minColor": "#FFFFFF",
                "maxColor": "#e1000f",  # Red color for consumption
                "dataClassColor": "category",
            },
            "series": [
                {
                    "name": "Densité de consommation",
                    "data": self.data,
                    "joinBy": ["land_id"],
                    "colorKey": "conso_density_percent",
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
                            "<b>{point.name}</b>:<br/>"
                            "Densité: {point.conso_density_percent:,.2f} %<br/>"
                            "Total: {point.total_conso_ha:,.1f} ha<br/>"
                            "Habitat: {point.habitat_ha:,.1f} ha<br/>"
                            "Activité: {point.activite_ha:,.1f} ha<br/>"
                            "Mixte: {point.mixte_ha:,.1f} ha<br/>"
                            "Route: {point.route_ha:,.1f} ha<br/>"
                            "Ferroviaire: {point.ferroviaire_ha:,.1f} ha"
                        ),
                    },
                },
                {
                    "name": "Consommation totale",
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
                            "z": d["total_conso_ha"],
                            "color": "#FC9292",
                            "total_conso_ha": d["total_conso_ha"],
                            "habitat_ha": d["habitat_ha"],
                            "activite_ha": d["activite_ha"],
                            "mixte_ha": d["mixte_ha"],
                            "route_ha": d["route_ha"],
                            "ferroviaire_ha": d["ferroviaire_ha"],
                            "inconnu_ha": d["inconnu_ha"],
                            "conso_density_percent": d["conso_density_percent"],
                        }
                        for d in self.data
                        if d["total_conso_ha"] > 0
                    ],
                    "tooltip": {
                        "valueDecimals": 1,
                        "pointFormat": (
                            "<b>{point.name}</b>:<br/>"
                            "Densité: {point.conso_density_percent:,.2f} %<br/>"
                            "Total: {point.total_conso_ha:,.1f} ha<br/>"
                            "Habitat: {point.habitat_ha:,.1f} ha<br/>"
                            "Activité: {point.activite_ha:,.1f} ha<br/>"
                            "Mixte: {point.mixte_ha:,.1f} ha<br/>"
                            "Route: {point.route_ha:,.1f} ha<br/>"
                            "Ferroviaire: {point.ferroviaire_ha:,.1f} ha"
                        ),
                    },
                },
            ],
        }


class ConsoMapExport(ConsoMap):
    @property
    def param(self):
        return super().param | {
            "chart": {
                **super().param["chart"],
                "height": "800px",
            },
            "credits": {
                "enabled": True,
                "text": "Source : Fichiers fonciers (Cerema, d'après DGFiP)",
            },
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": f"{super().param['title']['text']} sur le territoire {self.land.name}",
            },
            "subtitle": {"text": ""},
        }
