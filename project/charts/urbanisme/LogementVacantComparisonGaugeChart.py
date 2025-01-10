from project.charts.base_project_chart import ProjectChart
from public_data.domain.containers import PublicDataContainer


class LogementVacantComparisonGaugeChart(ProjectChart):
    """
    Graphique en barre de comparaison du nombre de logements vacants et de noueaux logements.
    """

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.project.land_proxy,
                start_date=self.project.analyse_start_date,
                end_date=self.project.analyse_end_date,
            )
        )

        # On récupère la dernière année de données disponible sur la période
        last_year_autorisation_logement_progression = autorisation_logement_progression.autorisation_logement[-1]

        # Stocker la valeur réelle
        raw_value = round(last_year_autorisation_logement_progression.percent_autorises_on_vacants_parc_general, 0)

        # Limiter l'aiguille à 100 mais afficher ">100%" si la valeur est supérieure
        display_value = ">100%" if raw_value > 100 else f"{raw_value}%"
        needle_value = min(raw_value, 100)

        return [
            {
                "name": "Rapport entre logements vacants et nouveaux logements autorisés (2023)",
                "data": [needle_value],
                "dataLabels": {
                    "format": display_value,
                    "borderWidth": 0,
                    "style": {"fontSize": "16px"},
                },
                "dial": {
                    "radius": "90%",
                    "backgroundColor": "black",
                    "baseWidth": 12,
                    "baseLength": "0%",
                    "rearLength": "0%",
                },
                "pivot": {"backgroundColor": "black", "radius": 6},
            }
        ]

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "gauge"},
            "title": {
                "text": (
                    "Rapport entre logements vacants et nouveaux "
                    f"logements autorisés ({self.project.analyse_end_date})"
                ),
            },
            "xAxis": {
                "categories": [
                    f"Nombre de nouveaux logements autorisés ({self.project.analyse_end_date})",
                    f"Nombre de logements en vacance structurelle ({self.project.analyse_end_date})",
                ]
            },
            "yAxis": {
                "min": 0,
                "max": 100,  # L'aiguille s'arrête à 100
                "tickPosition": "inside",
                "tickColor": "#FFFFFF",
                "tickLength": 20,
                "tickWidth": 0,
                "minorTickInterval": None,
                "labels": {"distance": 20, "style": {"fontSize": "14px"}},
                "lineWidth": 0,
                "plotBands": [
                    {
                        "from": 0,
                        "to": 20,
                        "color": "#44D492",
                        "thickness": 60,
                    },
                    {
                        "from": 20,
                        "to": 40,
                        "color": "#88F7E2",
                        "thickness": 60,
                    },
                    {"from": 40, "to": 60, "color": "#F6EB67", "thickness": 60},
                    {"from": 60, "to": 80, "color": "#FFA15C", "thickness": 60},
                    {
                        "from": 80,
                        "to": 100,
                        "color": "#FA233E",
                        "thickness": 60,
                    },
                ],
            },
            "tooltip": {
                "enabled": False,
            },
            "pane": {
                "startAngle": -90,
                "endAngle": 89.9,
                "background": None,
                "center": ["50%", "75%"],
                "size": "110%",
            },
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass
