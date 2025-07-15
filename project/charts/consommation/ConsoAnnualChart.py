from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS
from public_data.models import LandConso


class ConsoAnnualChart(DiagnosticChart):
    @property
    def data(self):
        return LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
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
            if item.total > 0
        ]

        # Calcul de la droite de tendance (régression linéaire simple)
        if len(data) >= 2:
            x_values = list(range(len(data)))
            y_values = [point["y"] for point in data]

            # Calcul de la moyenne
            x_average = sum(x_values) / len(x_values)
            y_average = sum(y_values) / len(y_values)

            # Calcul des coefficients de la droite de tendance
            numerator = sum((x - x_average) * (y - y_average) for x, y in zip(x_values, y_values))
            denominator = sum((x - x_average) ** 2 for x in x_values)

            if denominator != 0:
                slope = numerator / denominator
                intercept = y_average - slope * x_average

                # Création des points de la droite de tendance
                trend_data = [
                    {
                        "name": str(item.year),
                        "y": slope * i + intercept,
                    }
                    for i, item in enumerate(self.data)
                    if item.total > 0
                ]
            else:
                trend_data = []
        else:
            trend_data = []

        return [
            {
                "name": "Consommation totale",
                "data": data,
            },
            {
                "name": "Tendance",
                "data": trend_data,
                "type": "line",
                "dashStyle": "ShortDash",
                "color": "#666666",
                "marker": {"enabled": False},
                "enableMouseTracking": False,
            },
        ]

    @property
    def param(self):
        return super().param | {
            "title": {"text": "Consommation d'espaces NAF (ha)"},
            "series": self.series,
            "chart": {"type": "column"},
            "yAxis": {"title": {"text": ""}},
            "xAxis": {
                "type": "category",
                "plotBands": [
                    {
                        "color": "#e5f3ff",
                        "from": 2,
                        "to": 10,
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
