from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS
from public_data.models import LandArtifStockIndex


class ArtifSyntheseChart(DiagnosticChart):
    @property
    def data(self):
        return LandArtifStockIndex.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).order_by("millesime_index")

    @property
    def years(self):
        return [f"{'-'.join(map(str, stock_index.years))}" for stock_index in self.data]

    def get_formatted_flux_percent_str(self, value):
        if value is None:
            return ""
        if value > 0:
            return f'<span style="color: var(--text-default-error)">(+{round(value, DEFAULT_VALUE_DECIMALS)}%)</span>'
        elif value < 0:
            return f'<span style="color: var(--text-default-success)">({round(value, DEFAULT_VALUE_DECIMALS)}%)</span>'

    def get_formatted_flux_surface_str(self, value):
        if value is None:
            return ""
        if value > 0:
            return (
                f"<span style='color: var(--text-default-error)'>(+{round(value, DEFAULT_VALUE_DECIMALS)} ha)</span>"
            )
        elif value < 0:
            return (
                f"<span style='color: var(--text-default-success)'>({round(value, DEFAULT_VALUE_DECIMALS)} ha)</span>"
            )

    @property
    def series(self):
        return [
            {
                "name": "Stock d'artificialisation",
                "data": [
                    {
                        "y": stock_index.percent,
                        "flux_percent_str": self.get_formatted_flux_percent_str(stock_index.flux_percent),
                        "flux_stock_str": self.get_formatted_flux_surface_str(stock_index.flux_surface),
                        "stock": stock_index.surface,
                    }
                    for stock_index in self.data
                ],
                "color": "#f4cfc4",
            }
        ]

    @property
    def title(self):
        if self.land.is_interdepartemental:
            first_index = self.data.first().millesime_index
            last_index = self.data.last().millesime_index
            return f"Evolution du stock de surfaces artificialisées de {self.land.name} entre le millesime n°{first_index} et le millesime n°{last_index}"  # noqa: E501
        else:
            first_year = self.data.first().years[0]
            last_year = self.data.last().years[-1]
            return (
                f"Evolution du stock de surfaces artificialisées de {self.land.name} entre {first_year} et {last_year}"
            )

    @property
    def param(self):
        return {
            "chart": {"type": "bar"},
            "title": {"text": self.title},
            "xAxis": {
                "categories": self.years,
                "title": {"text": None},
            },
            "yAxis": {
                "min": 0,
                "title": {"text": "%", "align": "high"},
                "labels": {"overflow": "justify"},
                "gridLineWidth": 0,
            },
            "tooltip": {
                "valueSuffix": " %",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": """
                    Part artificialisée : <b>{point.y:.2f}%</b> {point.flux_percent_str} <br/>
                    Surface artificialisée : <b>{point.stock:,.2f} ha</b> {point.flux_stock_str}
                """,
            },
            "plotOptions": {
                "bar": {
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:.2f}%",
                    }
                }
            },
            "legend": {
                "enabled": False,
            },
            "credits": {"enabled": False},
            "series": self.series,
        }

    @property
    def data_table(self):
        return {
            "headers": [],
            "rows": [],
        }


class ArtifSyntheseChartExport(ArtifSyntheseChart):
    """Version export du graphique de synthèse d'artificialisation avec améliorations"""

    @property
    def series(self):
        return [
            {
                "name": "Surfaces artificialisées",
                "data": [stock_index.percent for stock_index in self.data],
                "color": "#FA4B42",
                "dataLabels": {
                    "enabled": True,
                    "format": "{point.y:.2f}%",
                    "style": {
                        "fontSize": "11px",
                        "fontWeight": "bold",
                    },
                },
            }
        ]

    @property
    def param(self):
        base_param = super().param

        # Récupérer le titre de base et ajouter (en %)
        base_title = base_param.get("title", {}).get("text", self.title)

        return base_param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": f"{base_title} (en %)",
            },
            "chart": {
                "type": "column",  # Utiliser column au lieu de bar pour une meilleure lisibilité en export
            },
            "xAxis": {
                "categories": self.years,
                "title": {"text": "Période"},
                "labels": {
                    "style": {"fontSize": "11px"},
                },
            },
            "yAxis": {
                "min": 0,
                "title": {
                    "text": "Part de surface artificialisée (%)",
                    "style": {"fontSize": "12px"},
                },
                "labels": {
                    "format": "{value}%",
                    "style": {"fontSize": "11px"},
                },
            },
            "tooltip": {"enabled": False},  # Désactiver le tooltip pour l'export
            "plotOptions": {
                "column": {
                    "borderWidth": 0,
                    "dataLabels": {
                        "enabled": True,
                    },
                }
            },
            "legend": {"enabled": False},
            "series": self.series,
        }

    @property
    def data_table(self):
        headers = ["Période", "Surface artificialisée (ha)", "Part artificialisée (%)"]

        rows = [
            {
                "name": "",
                "data": [
                    f"{'-'.join(map(str, stock_index.years))}",
                    f"{stock_index.surface:.2f}",
                    f"{stock_index.percent:.2f}",
                ],
            }
            for stock_index in self.data
        ]

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
        }
