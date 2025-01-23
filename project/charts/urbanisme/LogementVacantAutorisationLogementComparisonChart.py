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

    def __init__(self, project, start_date, end_date):
        super().__init__(project=project, start_date=start_date, end_date=end_date)

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.project.land_proxy,
                start_date=self.start_date,
                end_date=self.end_date,
            )
        )

        # On récupére la dernière année de données disponible sur la période
        last_year_autorisation_logement_progression = autorisation_logement_progression.autorisation_logement[-1]

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=self.start_date,
            end_date=self.end_date,
        )

        # On récupére la dernière année de données disponible sur la période
        last_year_logement_vacant_progression = logement_vacant_progression.logement_vacant[-1]

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
                    )
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
                    )
                },
                "color": LOGEMENT_VACANT_COLOR_PRIVE,
            },
        ]

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "bar"},
            "title": {
                "text": (
                    "Comparaison entre vacance des logements et autorisations de "
                    f"construction de logements ({self.end_date})"
                )
            },
            "xAxis": {
                "categories": [
                    f"Nombre de nouveaux logements autorisés ({self.end_date})",
                    f"Nombre de logements en vacance structurelle ({self.end_date})",
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
