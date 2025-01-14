from project.charts.base_project_chart import ProjectChart
from public_data.domain.containers import PublicDataContainer


class LogementVacantConsoProgressionChart(ProjectChart):
    """
    Graphique en colonne et ligne d'évolution de la consommation d'espaces NAF et de la vacance des logements.
    """

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        # Récupérer les données sur la vacance des logements
        logement_vacant_progression = (
            PublicDataContainer.logement_vacant_progression_service()
            .get_by_land(
                land=self.project.land_proxy,
                start_date=self.project.analyse_start_date,
                end_date=self.project.analyse_end_date,
            )
            .logement_vacant
        )
        logement_vacant_progression_total = [
            round(item.logements_vacants_parc_general, 2) for item in logement_vacant_progression
        ]

        # Extraire la période disponible de données de vacance des logements
        period = [item.year for item in logement_vacant_progression]

        # Récupérer les données de consommation d'espaces NAF pour la même période que la vacance des logements
        consommation_progresison = (
            PublicDataContainer.consommation_progression_service()
            .get_by_land(
                land=self.project.land_proxy,
                start_date=min(period),
                end_date=max(period),
            )
            .consommation
        )

        consommation_total_progresison = [round(item.total, 2) for item in consommation_progresison]
        consommation_habitat_progresison = [round(item.habitat, 2) for item in consommation_progresison]

        return [
            {
                "name": "Consommation totale ",
                "type": "column",
                "yAxis": 1,
                "data": consommation_total_progresison,
                "tooltip": {"valueSuffix": " ha"},
                "color": "#CFD1E5",
                "id": "main",
            },
            {
                "name": "Consommation à destination de l'habitat ",
                "type": "column",
                "yAxis": 1,
                "data": consommation_habitat_progresison,
                "tooltip": {"valueSuffix": " ha"},
                "color": "#6a6af4",
                "linkTo": "main",
            },
            {
                "name": "Nombre de logements en vacance structurelle (privé + bailleurs sociaux)",
                "type": "spline",
                "data": logement_vacant_progression_total,
                "color": "#fa4b42",
            },
        ], period

    @property
    def param(self):
        series, period = self._get_series()

        return super().param | {
            "title": {"text": "Évolutions de la consommation d'espaces NAF et de la vacance des logements"},
            "credits": {"enabled": False},
            "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
            "xAxis": [{"categories": period}],
            "yAxis": [
                {
                    "title": {"text": "Nombre de logements vacants", "style": {"color": "#fa4b42"}},
                    "labels": {"style": {"color": "#fa4b42"}},
                    "opposite": True,
                },
                {
                    "labels": {"style": {"color": "#6a6af4"}},
                    "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                },
            ],
            "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "shared": True},
            "series": series,
        }

    # To remove after refactoring
    def add_series(self):
        pass
