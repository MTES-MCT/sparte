from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import CEREMA_CREDITS
from public_data.domain.containers import PublicDataContainer


class ConsoByDeterminantPieChart(DiagnosticChart):
    """
    Graphique en secteurs de consommation totale par destination (habitat, activité, mixte etc.)
    """

    required_params = ["start_date", "end_date"]
    name = "determinant overview"

    @property
    def data(self):
        """Get total consumption stats for the land."""
        consommation_stats = PublicDataContainer.consommation_stats_service().get_by_land(
            land=self.land,
            start_date=int(self.params["start_date"]),
            end_date=int(self.params["end_date"]),
        )
        return consommation_stats

    @property
    def series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        category_to_attr = {
            "Habitat": "habitat",
            "Activité": "activite",
            "Mixte": "mixte",
            "Route": "route",
            "Ferré": "ferre",
            "Inconnu": "non_renseigne",
        }

        data_dict = {category: getattr(self.data, attr) for category, attr in category_to_attr.items()}

        return [
            {
                "name": "Destinations",
                "data": [{"name": category, "y": value} for category, value in data_dict.items()],
            }
        ]

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "pie"},
            "title": {
                "text": f"Consommation d'espaces par destination à {self.land.name} ({self.params['start_date']} - {self.params['end_date']})",  # noqa: E501
            },
            "tooltip": {"enabled": False},
            "plotOptions": {
                "pie": {
                    "allowPointSelect": True,
                    "cursor": "pointer",
                    "dataLabels": {
                        "distance": 15,
                        "enabled": True,
                        "format": "{point.name}<br />{point.y:.2f} Ha",
                    },
                }
            },
            "series": self.series,
        }

    @property
    def data_table(self):
        category_to_attr = {
            "Habitat": "habitat",
            "Activité": "activite",
            "Mixte": "mixte",
            "Route": "route",
            "Ferré": "ferre",
            "Inconnu": "non_renseigne",
        }

        headers = [
            "Destination",
            f"Consommation d'espaces NAF (ha) {self.params['start_date']}-{self.params['end_date']}",
        ]

        rows = [
            {
                "name": "",
                "data": [
                    category,
                    f"{getattr(self.data, attr):.2f}",
                ],
            }
            for category, attr in category_to_attr.items()
        ]

        # Ajouter la ligne Total
        total = sum(getattr(self.data, attr) for attr in category_to_attr.values())
        rows.append(
            {
                "name": "",
                "data": ["Total", f"{total:.2f}"],
            }
        )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
            "boldLastRow": True,
        }


class ConsoByDeterminantPieChartExport(ConsoByDeterminantPieChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "title": {
                "text": (
                    f"Destinations de la consommation d'espaces NAF de {self.land.name}"
                    f" entre {self.params['start_date']} et {self.params['end_date']} (en ha)"
                )
            },
            "plotOptions": {
                "pie": {
                    "allowPointSelect": False,
                    "dataLabels": {
                        "distance": 15,
                        "enabled": True,
                        "format": "{point.name}<br />{point.y:.2f} Ha ({point.percentage:.1f}%)",
                    },
                }
            },
        }
