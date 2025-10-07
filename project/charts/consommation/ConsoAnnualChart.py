from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
from public_data.models import LandConso


class ConsoAnnualChart(DiagnosticChart):
    @property
    def data(self):
        return LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            year__gte=2011,
        ).order_by("year")

    @property
    def data_table(self):
        headers = [
            "Année",
            "Consommation totale (ha)",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": f"{item.year}",
                    "data": [
                        item.year,
                        item.total / 10000,  # Conversion m² -> ha
                    ],
                }
                for item in self.data
            ],
        }

    @property
    def series(self):
        data = [
            {
                "name": str(item.year),
                "y": item.total / 10000,  # Conversion m² -> ha
            }
            for item in self.data
        ]

        return [
            {
                "name": "Consommation totale",
                "data": data,
            },
        ]

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": f"Consommation annuelle d'espaces NAF de {self.land.name} entre {self.data.first().year} et  {self.data.last().year} (ha)"  # noqa: E501
            },
            "subtitle": {
                "text": "La période de référence de la loi Climat & Résilience est mise en évidence par la bande bleue.",  # noqa: E501
            },
            "series": self.series,
            "chart": {"type": "column"},
            "yAxis": {"title": {"text": ""}},
            "xAxis": {
                "type": "category",
                "plotBands": [
                    {
                        "color": "#e5f3ff",
                        "from": -0.5,
                        "to": 9.5,
                        "label": {
                            "text": "Période de référence de la loi Climat & Résilience",
                            "style": {"color": "#95ceff", "fontWeight": "bold"},
                        },
                        "className": "plotband_blue",
                    },
                ],
            },
            "tooltip": {
                "valueSuffix": " ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "Consommation: {point.y:,.1f} ha",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "legend": {"enabled": False},
        }
