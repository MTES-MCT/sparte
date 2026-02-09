from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CONSOMMATION_HABITAT_COLOR,
    CONSOMMATION_TOTALE_COLOR,
    LOGEMENT_VACANT_COLOR_PRIVE,
    LOGEMENT_VACANT_COLOR_SOCIAL,
)
from public_data.domain.containers import PublicDataContainer


class LogementVacantConsoProgressionChart(DiagnosticChart):
    """
    Graphique d'évolution de la consommation d'espaces NAF et de la vacance des logements.
    Les logements vacants sont affichés en aires empilées (parc privé en bas + bailleurs sociaux dessus).
    La consommation est affichée en colonnes.
    La consommation peut ne pas couvrir toutes les années (ex: 2024), dans ce cas les valeurs sont null.
    """

    required_params = ["start_date", "end_date"]

    @property
    def name(self):
        return f"logement vacant conso progression {self.params['start_date']}-{self.params['end_date']}"

    def _get_data(self):
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])
        years = list(range(start_date, end_date + 1))

        logement_vacant_progression = (
            PublicDataContainer.logement_vacant_progression_service()
            .get_by_land(
                land=self.land,
                start_date=start_date,
                end_date=end_date,
            )
            .logement_vacant
        )
        data_parc_prive = [
            item.logements_vacants_parc_prive if item.logements_vacants_parc_prive is not None else 0
            for item in logement_vacant_progression
        ]
        data_parc_social = [
            item.logements_vacants_parc_social if item.logements_vacants_parc_social is not None else None
            for item in logement_vacant_progression
        ]

        # La conso peut ne pas couvrir toutes les années demandées (ex: 2024),
        # on tente avec end_date décroissant jusqu'à trouver des données
        consommation_items = []
        for conso_end in range(end_date, start_date - 1, -1):
            try:
                consommation_items = (
                    PublicDataContainer.consommation_progression_service()
                    .get_by_land(
                        land=self.land,
                        start_date=start_date,
                        end_date=conso_end,
                    )
                    .consommation
                )
                break
            except Exception:
                continue

        nb_conso = len(consommation_items)
        nb_years = len(years)
        padding = nb_years - nb_conso

        consommation_total = [round(item.total, 2) for item in consommation_items]
        consommation_habitat = [round(item.habitat, 2) for item in consommation_items] + [None] * padding

        # Pour les années sans données de conso, on met un point à y=0 avec un dataLabel
        for i in range(padding):
            year = years[nb_conso + i]
            consommation_total.append(
                {
                    "y": 0,
                    "dataLabels": {
                        "enabled": True,
                        "format": f"Consommation {year} :<br/>données à paraître<br/>en mai 2026",
                        "style": {
                            "color": "#666",
                            "fontSize": "11px",
                            "fontStyle": "italic",
                            "fontWeight": "normal",
                            "textOutline": "none",
                            "width": "80px",
                            "textAlign": "center",
                        },
                        "verticalAlign": "bottom",
                        "align": "left",
                        "x": 0,
                        "y": -5,
                    },
                }
            )

        return {
            "years": years,
            "data_parc_prive": data_parc_prive,
            "data_parc_social": data_parc_social,
            "consommation_total": consommation_total,
            "consommation_habitat": consommation_habitat,
        }

    def _build_area_data_with_extension(self, values):
        """
        Construit les données pour une série area avec extension d'une demi-année
        au début et à la fin. Chaque point a une coordonnée x explicite.
        Les points de bord sont marqués pour ne pas afficher de tooltip.
        """
        if not values:
            return []

        n = len(values)
        # Point de début à x=-0.5 avec la valeur du premier point (sans tooltip)
        data = [{"x": -0.5, "y": values[0], "custom": {"skipTooltip": True}}]
        # Points normaux aux positions entières
        for i, val in enumerate(values):
            data.append({"x": i, "y": val})
        # Point de fin à x=n-0.5 avec la valeur du dernier point (sans tooltip)
        data.append({"x": n - 0.5, "y": values[-1], "custom": {"skipTooltip": True}})
        return data

    def _get_series(self):
        data = self._get_data()

        series = [
            {
                "name": "Logements vacants de plus de 2 ans dans le parc privé",
                "type": "area",
                "yAxis": 0,
                "data": self._build_area_data_with_extension(data["data_parc_prive"]),
                "color": LOGEMENT_VACANT_COLOR_PRIVE,
                "stack": "vacants",
            },
        ]

        if self.land.has_logements_vacants_social:
            series.append(
                {
                    "name": "Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux",
                    "type": "area",
                    "yAxis": 0,
                    "data": self._build_area_data_with_extension(data["data_parc_social"]),
                    "color": LOGEMENT_VACANT_COLOR_SOCIAL,
                    "stack": "vacants",
                }
            )

        series.extend(
            [
                {
                    "name": "Consommation totale",
                    "type": "column",
                    "yAxis": 1,
                    "data": data["consommation_total"],
                    "tooltip": {"valueSuffix": " ha"},
                    "color": CONSOMMATION_TOTALE_COLOR,
                    "stack": "conso",
                    "id": "main",
                },
                {
                    "name": "Consommation à destination de l'habitat",
                    "type": "column",
                    "yAxis": 1,
                    "data": data["consommation_habitat"],
                    "tooltip": {"valueSuffix": " ha"},
                    "color": CONSOMMATION_HABITAT_COLOR,
                    "stack": "conso",
                    "linkTo": "main",
                },
            ]
        )

        return series

    @property
    def data_table(self):
        data = self._get_data()
        headers = ["Année"] + [str(year) for year in data["years"]]

        rows = []

        rows.append(
            {"name": "", "data": ["Logements vacants de plus de 2 ans dans le parc privé"] + data["data_parc_prive"]}
        )

        if self.land.has_logements_vacants_social:
            rows.append(
                {
                    "name": "",
                    "data": ["Logements vacants de plus de 3 mois dans le parc des bailleurs sociaux"]
                    + data["data_parc_social"],
                }
            )
            total_vacants = [
                prive + (social or 0) for prive, social in zip(data["data_parc_prive"], data["data_parc_social"])
            ]
            rows.append({"name": "", "data": ["Total logements en vacance structurelle"] + total_vacants})
        else:
            rows.append({"name": "", "data": ["Total logements en vacance structurelle"] + data["data_parc_prive"]})

        # Extraire les valeurs numériques pour la data_table (les points avec dataLabels sont des dicts)
        conso_total_values = [v if not isinstance(v, dict) else None for v in data["consommation_total"]]
        conso_habitat_values = data["consommation_habitat"]

        rows.append({"name": "", "data": ["Consommation totale (ha)"] + conso_total_values})

        rows.append({"name": "", "data": ["Consommation à destination de l'habitat (ha)"] + conso_habitat_values})

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
        }

    @property
    def param(self):
        data = self._get_data()

        # Configuration de l'axe X :
        # - min/max à -0.5/+0.5 des bornes pour que les aires s'étendent au-delà des colonnes
        # - tickPositions explicite pour n'afficher que les années (évite un "-1" parasite à gauche)
        x_axis = {
            "categories": [str(year) for year in data["years"]],
            "min": -0.5,
            "max": len(data["years"]) - 0.5,
            "tickPositions": list(range(len(data["years"]))),
        }

        return super().param | {
            "title": {"text": "Évolution de la consommation d'espaces NAF et de la vacance des logements"},
            "credits": {"enabled": False},
            "plotOptions": {
                "column": {"borderWidth": 0, "stacking": "normal"},
                "area": {"stacking": "normal", "lineWidth": 1, "marker": {"enabled": False}},
            },
            "xAxis": x_axis,
            "yAxis": [
                {
                    "title": {
                        "text": "Nombre de logements vacants",
                        "style": {"color": LOGEMENT_VACANT_COLOR_PRIVE},
                    },
                    "labels": {"style": {"color": LOGEMENT_VACANT_COLOR_PRIVE}},
                    "opposite": True,
                },
                {
                    "labels": {"style": {"color": "#6a6af4"}},
                    "title": {"text": "Consommation d'espaces NAF (ha)", "style": {"color": "#6a6af4"}},
                },
            ],
            "tooltip": {"headerFormat": "<b>{point.key}</b><br/>", "shared": True},
            "series": self._get_series(),
        }
