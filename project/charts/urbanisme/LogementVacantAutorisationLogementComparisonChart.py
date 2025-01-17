from project.charts.base_project_chart import ProjectChart
from project.charts.constants import (
    AUTORISATION_CONSTRUCTION_COLOR,
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantAutorisationLogementComparisonChart(ProjectChart):
    """
    Graphique en barre de comparaison du nombre de logements vacants et d'autorisations de construction de logements'.
    """

    # Dates en dur
    START_DATE = 2019
    END_DATE = 2023

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.project.land_proxy,
                start_date=self.START_DATE,
                end_date=self.END_DATE,
            )
        )

        # On récupére la dernière année de données disponible sur la période
        last_year_autorisation_logement_progression = autorisation_logement_progression.autorisation_logement[-1]

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=self.START_DATE,
            end_date=self.END_DATE,
        )

        # On récupére la dernière année de données disponible sur la période
        last_year_logement_vacant_progression = logement_vacant_progression.logement_vacant[-1]

        return [
            {
                "name": "Autorisations de construction de logements",
                "data": [last_year_autorisation_logement_progression.logements_autorises, 0],
                "stack": "construction",
                "custom": {
                    "percentage": round(
                        last_year_autorisation_logement_progression.percent_autorises_on_parc_general, 2
                    )
                },
                "color": AUTORISATION_CONSTRUCTION_COLOR,
            },
            {
                "name": "Logements vacants depuis plus de 2 ans dans le parc privé",
                "data": [0, last_year_logement_vacant_progression.logements_vacants_parc_prive],
                "stack": "vacants",
                "custom": {
                    "percentage": round(last_year_logement_vacant_progression.logements_vacants_parc_prive_percent, 2)
                },
                "color": LOGEMENT_VACANT_COLOR_PRIVE,
            },
            {
                "name": "Logements vacants depuis plus de 3 mois dans le parc des bailleurs sociaux",
                "data": [0, last_year_logement_vacant_progression.logements_vacants_parc_social],
                "stack": "vacants",
                "custom": {
                    "percentage": round(last_year_logement_vacant_progression.logements_vacants_parc_social_percent, 2)
                },
                "color": LOGEMENT_VACANT_COLOR_SOCIAL,
            },
        ]

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bar"},
            "title": {
                "text": (
                    "Comparaison entre vacance des logements et autorisations de "
                    f"construction de logements ({self.END_DATE})"
                )
            },
            "xAxis": {
                "categories": [
                    f"Nombre de nouveaux logements autorisés ({self.END_DATE})",
                    f"Nombre de logements en vacance structurelle ({self.END_DATE})",
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
                    "borderWidth": 0,
                    "stacking": "normal",
                    "dataLabels": {
                        "enabled": True,
                        "allowOverlap": True,
                        "overflow": "allow",
                        "align": "right",
                        "style": {"color": "white", "fontSize": "14px", "textOutline": "none"},
                    },
                }
            },
            "series": self._get_series(),
        }

    # To remove after refactoring
    def add_series(self):
        pass