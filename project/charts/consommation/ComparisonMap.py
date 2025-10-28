import json

from django.core.serializers import serialize
from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import LEGEND_NAVIGATION_EXPORT
from project.charts.mixins.ComparisonChartMixin import ComparisonChartMixin
from public_data.models import AdminRef, LandConsoStats


class ComparisonMap(ComparisonChartMixin, DiagnosticChart):
    def __init__(self, land, params):
        """
        Initialise la carte de comparaison des territoires.

        Args:
            land: Instance de LandModel représentant le territoire principal
            params: Dictionnaire de paramètres devant contenir 'start_date', 'end_date',
                   et optionnellement 'comparison_lands' pour afficher les territoires de comparaison

        Raises:
            ValueError: Si les paramètres requis ne sont pas présents
        """
        if "start_date" not in params:
            raise ValueError("Le paramètre 'start_date' est obligatoire")

        if "end_date" not in params:
            raise ValueError("Le paramètre 'end_date' est obligatoire")

        super().__init__(land=land, params=params)

    @property
    def lands(self):
        """
        Récupère le territoire principal + les territoires de comparaison.
        Utilise la méthode du mixin pour gérer la sélection des territoires.
        """
        return self._get_comparison_lands()

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
        land_info = [(land.land_id, land.land_type) for land in self.lands]

        stats_dict = {}
        for land_id, land_type in land_info:
            stats = LandConsoStats.objects.filter(
                land_id=land_id,
                land_type=land_type,
                from_year=self.start_year,
                to_year=self.end_year,
            ).first()

            if stats:
                stats_dict[land_id] = stats

        return stats_dict

    @cached_property
    def data(self):
        """
        Transforme les données de consommation en format utilisable par la carte.
        Les surfaces sont déjà en m² dans LandConsoStats, on les convertit en ha.
        Calcule aussi la densité de consommation (ha consommés / ha de surface totale).
        """
        # Create a dict for quick land lookup (lands is a list from mixin)
        lands_dict = {land.land_id: land for land in self.lands}

        data = []
        for land_id, stats in self.conso_data.items():
            # Get the land object to access its surface
            land = lands_dict.get(land_id)
            if not land:
                continue

            # Convert m² to ha (divide by 10000)
            total_conso_ha = (stats.total or 0) / 10000

            # Calculate density: consumption (ha) / territory surface (ha)
            # Multiply by 100 to get percentage
            conso_density_percent = (total_conso_ha / land.surface * 100) if land.surface > 0 else 0

            # Check if this is the main territory
            is_main = land.land_id == self.land.land_id and land.land_type == self.land.land_type

            data.append(
                {
                    "land_id": land_id,
                    "land_type": land.land_type,
                    "name": land.name,
                    "total_conso_ha": total_conso_ha,
                    "conso_density_percent": conso_density_percent,
                    "is_main": is_main,
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
            "Territoire",
            "Type",
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
                        d["name"] + (" (principal)" if d["is_main"] else ""),
                        AdminRef.get_label(d["land_type"]),
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
                for d in sorted(self.data, key=lambda x: (-x["is_main"], x["name"]))
            ],
        }

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
            "title": {"text": f"Carte de comparaison - {self.start_year} à {self.end_year}"},
            "mapNavigation": {"enabled": len(self.lands) > 20},
            "legend": {
                "title": {"text": "Densité de consommation (%)"},
            },
            "colorAxis": {
                "min": min([d["conso_density_percent"] for d in data_with_values]) if data_with_values else 0,
                "max": max([d["conso_density_percent"] for d in data_with_values]) if data_with_values else 1,
                "minColor": "#FFFFFF",
                "maxColor": "#e1000f",
            },
            "series": [
                {
                    "name": "Densité de consommation",
                    "colorKey": "conso_density_percent",
                    "data": [
                        {
                            "land_id": d["land_id"],
                            "conso_density_percent": d["conso_density_percent"],
                            "value": d["conso_density_percent"],
                            "borderColor": "#0063CB" if d["is_main"] else "#666",
                            "borderWidth": 3 if d["is_main"] else 1,
                        }
                        for d in data_with_values
                    ],
                    "joinBy": "land_id",
                    "states": {
                        "hover": {
                            "borderColor": "#000",
                            "borderWidth": 2,
                        }
                    },
                    "dataLabels": {
                        "enabled": False,
                    },
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": (
                            "<b>{point.name}</b><br/>"
                            "Densité de consommation : {{point.conso_density_percent:.2f}} %<br/>"
                        ),
                    },
                },
                {
                    "name": "Consommation totale",
                    "type": "mapbubble",
                    "data": [
                        {
                            "land_id": d["land_id"],
                            "z": d["total_conso_ha"],
                        }
                        for d in data_with_values
                    ],
                    "joinBy": "land_id",
                    "minSize": "4%",
                    "maxSize": "12%",
                    "color": "#e1000f",
                    "marker": {
                        "fillOpacity": 0.6,
                        "lineWidth": 1,
                        "lineColor": "#FFF",
                    },
                    "tooltip": {
                        "headerFormat": "",
                        "pointFormat": ("<b>{point.name}</b><br/>" "Consommation totale : {{point.z:.2f}} ha<br/>"),
                    },
                },
            ],
        }


class ComparisonMapExport(ComparisonMap):
    """Export version with navigation legend"""

    @property
    def param(self):
        return super().param | LEGEND_NAVIGATION_EXPORT
