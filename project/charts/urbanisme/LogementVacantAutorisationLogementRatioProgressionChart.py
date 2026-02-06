from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    AUTORISATION_CONSTRUCTION_COLOR,
    LOGEMENT_VACANT_COLOR_GENERAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantAutorisationLogementRatioProgressionChart(DiagnosticChart):
    """
    Graphique en colonnes groupées d'évolution du nombre de logements vacants
    et du nombre d'autorisations de construction de logements.
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"logement vacant autorisation evolution {self.params['start_date']}-{self.params['end_date']}"

    def _get_series(self):
        """
        Génère et retourne la liste des séries à utiliser dans le graphique.
        """
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.land,
            start_date=start_date,
            end_date=end_date,
        )

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
            )
        )

        # Utilise le parc général (privé + social) ou uniquement le privé si pas de données sociales
        if self.land.has_logements_vacants_social:
            data_vacants = [
                d.logements_vacants_parc_general if d.logements_vacants_parc_general is not None else 0
                for d in logement_vacant_progression.logement_vacant
            ]
        else:
            data_vacants = [
                d.logements_vacants_parc_prive if d.logements_vacants_parc_prive is not None else 0
                for d in logement_vacant_progression.logement_vacant
            ]

        data_autorisations = [d.logements_autorises for d in autorisation_logement_progression.autorisation_logement]

        return [
            {
                "name": "Nombre de logements en vacance structurelle",
                "data": data_vacants,
                "color": LOGEMENT_VACANT_COLOR_GENERAL,
            },
            {
                "name": "Nombre d'autorisations de construction de logements",
                "data": data_autorisations,
                "color": AUTORISATION_CONSTRUCTION_COLOR,
            },
        ]

    @property
    def data_table(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=self.land,
            start_date=start_date,
            end_date=end_date,
        )

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
            )
        )

        years = list(range(start_date, end_date + 1))
        headers = ["Année"] + [str(year) for year in years]

        # Utilise le parc général (privé + social) ou uniquement le privé si pas de données sociales
        if self.land.has_logements_vacants_social:
            data_vacants = [
                d.logements_vacants_parc_general if d.logements_vacants_parc_general is not None else 0
                for d in logement_vacant_progression.logement_vacant
            ]
        else:
            data_vacants = [
                d.logements_vacants_parc_prive if d.logements_vacants_parc_prive is not None else 0
                for d in logement_vacant_progression.logement_vacant
            ]

        data_autorisations = [d.logements_autorises for d in autorisation_logement_progression.autorisation_logement]

        rows = [
            {"name": "", "data": ["Nombre de logements en vacance structurelle"] + data_vacants},
            {"name": "", "data": ["Nombre d'autorisations de construction de logements"] + data_autorisations},
        ]

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
        }

    @property
    def param(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])

        return super().param | {
            "chart": {"type": "column"},
            "title": {
                "text": (
                    "Évolution du nombre de logements vacants et du nombre "
                    "d'autorisations de construction de logements"
                )
            },
            "xAxis": {"categories": [str(year) for year in range(start_date, end_date + 1)]},
            "yAxis": {"title": {"text": ""}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": ('<span style="color:{point.color}">●</span> ' "{series.name}: <b>{point.y}</b>"),
            },
            "plotOptions": {
                "column": {
                    "grouping": True,
                }
            },
            "series": self._get_series(),
        }
