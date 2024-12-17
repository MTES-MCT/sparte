from project.charts.base_project_chart import ProjectChart
from project.charts.constants import CEREMA_CREDITS
from public_data.domain.containers import PublicDataContainer


class ConsoByDeterminantPieChart(ProjectChart):
    """
    Graphique en secteurs de consommation totale par destination (habitat, activité, mixte etc.)
    """

    name = "determinant overview"

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        consommation_total = PublicDataContainer.consommation_stats_service().get_by_land(
            land=self.project.land_proxy,
            start_date=self.project.analyse_start_date,
            end_date=self.project.analyse_end_date,
        )

        category_to_attr = {
            "Habitat": "habitat",
            "Activité": "activite",
            "Mixte": "mixte",
            "Route": "route",
            "Ferré": "ferre",
            "Inconnu": "non_renseigne",
        }

        data = {category: getattr(consommation_total, attr) for category, attr in category_to_attr.items()}

        return [
            {
                "name": "Destinations",
                "data": [{"name": category, "y": value} for category, value in data.items()],
            }
        ]

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "pie"},
            "title": {
                "text": "Sur la période",
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
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass


class ConsoByDeterminantPieChartExport(ConsoByDeterminantPieChart):
    @property
    def param(self):
        return super().param | {
            "credits": CEREMA_CREDITS,
            "title": {
                "text": (
                    f"Destinations de la consommation d'espace de {self.project.territory_name}"
                    f" entre {self.project.analyse_start_date} et {self.project.analyse_end_date} (en ha)"
                )
            },
        }
