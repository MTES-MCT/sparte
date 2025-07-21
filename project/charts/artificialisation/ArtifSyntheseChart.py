from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
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
        return [f"{'-'.join(map(str,stock_index.years))}" for stock_index in self.data]

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
            return f"Evolution du stock de sols artificialisés de {self.land.name} entre le millesime n°{first_index} et le millesime n°{last_index}"  # noqa: E501
        else:
            first_year = self.data.first().years[0]
            last_year = self.data.last().years[-1]
            return f"Evolution du stock de sols artificialisés de {self.land.name} entre {first_year} et {last_year}"

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
