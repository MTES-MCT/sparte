from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    AUTORISATION_CONSTRUCTION_COLOR,
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantAutorisationLogementComparisonChart(DiagnosticChart):
    """
    Graphique en barre de comparaison du nombre de logements vacants et d'autorisations de construction de logements'.
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"logement vacant autorisation comparison {self.params['start_date']}-{self.params['end_date']}"

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
            )
        )

        # On récupére la dernière année de données disponible sur la période
        last_year_autorisation_logement_progression = (
            autorisation_logement_progression.get_last_year_autorisation_logement()
        )

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.land,
            start_date=start_date,
            end_date=end_date,
        )

        # On récupére la dernière année de données disponible sur la période
        last_year_logement_vacant_progression = logement_vacant_progression.get_last_year_logement_vacant()

        # Handle cases where data is not available
        if last_year_autorisation_logement_progression is None or last_year_logement_vacant_progression is None:
            return []

        return [
            {
                "name": "Autorisations de construction de logements",
                "data": [last_year_autorisation_logement_progression.logements_autorises, None],
                "stack": "construction",
                "custom": {
                    "percentage": round(
                        last_year_autorisation_logement_progression.percent_autorises_on_parc_general, 2
                    )
                },
                "color": AUTORISATION_CONSTRUCTION_COLOR,
            },
            {
                "name": "Logements vacants depuis plus de 3 mois dans le parc des bailleurs sociaux",
                "data": [None, last_year_logement_vacant_progression.logements_vacants_parc_social],
                "stack": "vacants",
                "custom": {
                    "percentage": round(
                        last_year_logement_vacant_progression.logements_vacants_parc_social_on_parc_general_percent, 2
                    ),
                    "percentage_on_specific_parc": round(
                        last_year_logement_vacant_progression.logements_vacants_parc_social_percent, 2
                    ),
                },
                "color": LOGEMENT_VACANT_COLOR_SOCIAL,
            },
            {
                "name": "Logements vacants depuis plus de 2 ans dans le parc privé",
                "data": [None, last_year_logement_vacant_progression.logements_vacants_parc_prive],
                "stack": "vacants",
                "custom": {
                    "percentage": round(
                        last_year_logement_vacant_progression.logements_vacants_parc_prive_on_parc_general_percent, 2
                    ),
                    "percentage_on_specific_parc": round(
                        last_year_logement_vacant_progression.logements_vacants_parc_prive_percent, 2
                    ),
                },
                "color": LOGEMENT_VACANT_COLOR_PRIVE,
            },
        ]

    @property
    def data_table(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
            )
        )

        last_year_autorisation_logement_progression = (
            autorisation_logement_progression.get_last_year_autorisation_logement()
        )

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.land,
            start_date=start_date,
            end_date=end_date,
        )

        last_year_logement_vacant_progression = logement_vacant_progression.get_last_year_logement_vacant()

        if last_year_autorisation_logement_progression is None or last_year_logement_vacant_progression is None:
            return {
                "headers": ["Type", "Nombre", "% du parc total"],
                "rows": [],
            }

        headers = ["Type", "Nombre", "% du parc total"]

        rows = []

        # Ligne pour les autorisations
        rows.append(
            {
                "name": "",
                "data": [
                    f"Autorisations de construction de logements ({end_date})",
                    last_year_autorisation_logement_progression.logements_autorises,
                    round(last_year_autorisation_logement_progression.percent_autorises_on_parc_general, 2),
                ],
            }
        )

        # Ligne pour les logements vacants parc privé
        rows.append(
            {
                "name": "",
                "data": [
                    f"Logements vacants depuis plus de 2 ans dans le parc privé ({end_date})",
                    last_year_logement_vacant_progression.logements_vacants_parc_prive,
                    round(
                        last_year_logement_vacant_progression.logements_vacants_parc_prive_on_parc_general_percent, 2
                    ),
                ],
            }
        )

        # Ligne pour les logements vacants parc social
        rows.append(
            {
                "name": "",
                "data": [
                    f"Logements vacants depuis plus de 3 mois dans le parc des bailleurs sociaux ({end_date})",
                    last_year_logement_vacant_progression.logements_vacants_parc_social,
                    round(
                        last_year_logement_vacant_progression.logements_vacants_parc_social_on_parc_general_percent, 2
                    ),
                ],
            }
        )

        # Ligne total logements vacants
        total_vacants = (
            last_year_logement_vacant_progression.logements_vacants_parc_prive
            + last_year_logement_vacant_progression.logements_vacants_parc_social
        )
        total_percent = (
            last_year_logement_vacant_progression.logements_vacants_parc_prive_on_parc_general_percent
            + last_year_logement_vacant_progression.logements_vacants_parc_social_on_parc_general_percent
        )
        rows.append(
            {
                "name": "",
                "data": [
                    f"Total logements en vacance structurelle ({end_date})",
                    total_vacants,
                    round(total_percent, 2),
                ],
            }
        )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
            "boldLastRow": True,
        }

    @property
    def param(self):
        end_date = int(self.params["end_date"])

        return super().param | {
            "chart": {"type": "bar"},
            "title": {
                "text": (
                    "Comparaison entre vacance des logements et autorisations de "
                    f"construction de logements ({end_date})"
                )
            },
            "xAxis": {
                "categories": [
                    f"Nombre de nouveaux logements autorisés ({end_date})",
                    f"Nombre de logements en vacance structurelle ({end_date})",
                ]
            },
            "yAxis": {
                "min": 0,
                "title": {"text": ""},
            },
            "tooltip": {
                "headerFormat": "<b>{series.name}: {point.y}</b><br/>",
                "pointFormat": "Soit {point.series.options.custom.percentage}% du parc total (privé + social)",
            },
            "plotOptions": {
                "series": {
                    "grouping": False,
                    "stacking": "normal",
                }
            },
            "series": self._get_series(),
        }
