from project.charts.base_project_chart import ProjectChart
from public_data.domain.containers import PublicDataContainer


class LogementVacantRatioProgressionChart(ProjectChart):
    """
    Graphique en barre d'évolution du taux de logements vacants privé et social
    """

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.project.land_proxy,
            start_date=self.project.analyse_start_date,
            end_date=self.project.analyse_end_date,
        )

        data_parc_privé = [d.logements_vacants_parc_prive_percent for d in logement_vacant_progression.logement_vacant]

        data_parc_social = [
            d.logements_vacants_parc_social_percent for d in logement_vacant_progression.logement_vacant
        ]

        categories = [str(d.year) for d in logement_vacant_progression.logement_vacant]

        return [
            {
                "name": ("Taux de vacance de plus de 2 ans dans le parc privé"),
                "data": data_parc_privé,
            },
            {
                "name": ("Taux de vacance de plus de 3 mois dans le parc des bailleurs sociaux"),
                "data": data_parc_social,
            },
        ], categories

    @property
    def param(self):
        series, categories = self._get_series()

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": "Evolution du taux de vacance des logements sur le territoire (en %)"},
            "xAxis": [{"categories": categories}],
            "yAxis": {"title": {"text": ""}},
            "tooltip": {
                "tooltip": {"valueSuffix": " %"},
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": ('<span style="color:{point.color}">●</span> ' "{series.name}: <b>{point.y:.2f} %</b>"),
            },
            "series": series,
        }

    # To remove after refactoring
    def add_series(self):
        pass
