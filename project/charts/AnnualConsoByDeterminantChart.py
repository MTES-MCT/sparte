from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_VALUE_DECIMALS,
    LEGEND_NAVIGATION_EXPORT,
)
from project.utils import add_total_line_column
from public_data.domain.containers import PublicDataContainer


class AnnualConsoByDeterminantChart(DiagnosticChart):
    """
    Graphique en barre de consommation annuelle par destination (habitat, activité, mixte etc.)
    """

    required_params = ["start_date", "end_date"]
    name = "determinant per year"

    @property
    def data(self):
        """Get consumption progression data for the land."""
        consommation_progression = PublicDataContainer.consommation_progression_service().get_by_land(
            land=self.land,
            start_date=int(self.params["start_date"]),
            end_date=int(self.params["end_date"]),
        )
        return consommation_progression.consommation

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
            "Total": "total",
        }

        data_dict = {category: {} for category in category_to_attr.keys()}

        for annual_conso in self.data:
            for category, attr in category_to_attr.items():
                data_dict[category][annual_conso.year] = getattr(annual_conso, attr)

        series = [
            {
                "name": determinant,
                "data": [{"name": year, "y": value} for year, value in data_dict[determinant].items()],
                **(
                    {"id": "main", "type": "column", "zIndex": 0, "stacking": None, "color": "#CFD1E5"}
                    if determinant == "Total"
                    else {"type": "column", "stacking": "normal", "zIndex": 1}
                ),
            }
            for determinant in data_dict
        ]

        return series

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {
                "text": f"Évolution annuelle de la consommation d'espaces par destination à {self.land.name} ({self.params['start_date']} - {self.params['end_date']})"  # noqa: E501
            },
            "yAxis": {
                "title": {"text": "Consommation d'espaces (en ha)"},
                "stackLabels": {"enabled": True, "format": "{total:,.2f}"},
            },
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "xAxis": {"type": "category"},
            "legend": {
                **super().param["legend"],
                "layout": "vertical",
                "align": "right",
                "verticalAlign": "middle",
            },
            "plotOptions": {"series": {"grouping": False, "borderWidth": 0}},
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

        # Créer une structure {destination: {year: value}} pour add_total_line_column
        data_dict = {}
        for category, attr in category_to_attr.items():
            data_dict[category] = {}
            for annual_conso in self.data:
                data_dict[category][str(annual_conso.year)] = round(
                    getattr(annual_conso, attr), DEFAULT_VALUE_DECIMALS
                )

        # Ajouter les totaux (ligne et colonne)
        data_with_totals = add_total_line_column(data_dict, column=True, line=True)

        # Générer les années pour les headers
        years = sorted(set(annual_conso.year for annual_conso in self.data))
        headers = ["Destination"] + [str(year) for year in years] + ["Total"]

        # Convertir en format data_table
        rows = []
        for category in category_to_attr.keys():
            row_data = (
                [category]
                + [data_with_totals[category].get(str(year), 0) for year in years]
                + [data_with_totals[category].get("total", 0)]
            )
            rows.append({"name": "", "data": row_data})

        # Ajouter la ligne Total à la fin
        if "Total" in data_with_totals:
            total_row_data = (
                ["Total"]
                + [data_with_totals["Total"].get(str(year), 0) for year in years]
                + [data_with_totals["Total"].get("total", 0)]
            )
            rows.append({"name": "", "data": total_row_data})

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
            "boldLastColumn": True,
            "boldLastRow": True,
        }


class AnnualConsoByDeterminantChartExport(AnnualConsoByDeterminantChart):
    @property
    def param(self):
        return super().param | {
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
                "layout": "horizontal",
                "align": "center",
                "verticalAlign": "bottom",
            },
            "yAxis": {
                **super().param["yAxis"],
                "stackLabels": {"enabled": False},
            },
            "credits": CEREMA_CREDITS,
            "title": {
                "text": (
                    f"Consommation annuelle d'espaces NAF par destination de {self.land.name}"
                    f" entre {self.params['start_date']} et {self.params['end_date']} (en ha)"
                )
            },
        }
