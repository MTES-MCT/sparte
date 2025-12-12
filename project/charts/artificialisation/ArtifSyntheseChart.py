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
        data_points = []
        flux_points = []
        data_list = list(self.data)

        for i, stock_index in enumerate(data_list):
            data_points.append(
                {
                    "y": stock_index.percent,
                    "surface": stock_index.surface,
                }
            )

            # Pour la courbe de flux, on place le point entre les deux barres
            if i > 0:
                flux_surface = stock_index.flux_surface or 0
                # Position au milieu entre la barre précédente et actuelle
                flux_points.append(
                    {
                        "x": i - 0.5,
                        "y": (data_list[i - 1].percent + stock_index.percent) / 2,
                        "flux": flux_surface,
                    }
                )

        series = [
            {
                "name": "Part artificialisée",
                "type": "column",
                "data": data_points,
                "color": "#818CF8",
                "borderRadius": 3,
                "zIndex": 1,
            },
        ]

        # Ajouter les lignes de connexion entre les barres
        if len(data_list) > 1:
            for i in range(1, len(data_list)):
                flux_surface = data_list[i].flux_surface or 0
                # Ligne entre les deux barres
                series.append(
                    {
                        "name": "Flux" if i == 1 else f"Flux {i}",
                        "type": "line",
                        "data": [
                            {"x": i - 1, "y": data_list[i - 1].percent},
                            {"x": i, "y": data_list[i].percent},
                        ],
                        "color": "#F97316",
                        "lineWidth": 2,
                        "marker": {"enabled": False},
                        "dataLabels": {"enabled": False},
                        "enableMouseTracking": False,
                        "showInLegend": i == 1,
                        "zIndex": 2,
                    }
                )
                # Point au milieu pour afficher le label du flux
                flux_label = f"+{flux_surface:,.1f} ha" if flux_surface >= 0 else f"{flux_surface:,.1f} ha"
                series.append(
                    {
                        "name": f"Flux label {i}",
                        "type": "scatter",
                        "data": [
                            {
                                "x": i - 0.5,
                                "y": (data_list[i - 1].percent + data_list[i].percent) / 2,
                                "name": flux_label,
                            }
                        ],
                        "color": "#F97316",
                        "marker": {"radius": 0},
                        "dataLabels": {
                            "enabled": True,
                            "format": "{point.name}",
                            "style": {
                                "fontSize": "11px",
                                "fontWeight": "bold",
                                "color": "#F97316",
                                "textOutline": "2px white",
                            },
                        },
                        "enableMouseTracking": False,
                        "showInLegend": False,
                        "zIndex": 3,
                    }
                )

        return series

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
            "chart": {
                "type": "column",
                "backgroundColor": "transparent",
            },
            "title": {
                "text": self.title,
                "style": {
                    "fontSize": "14px",
                    "fontWeight": "600",
                },
            },
            "xAxis": {
                "categories": self.years,
                "title": {"text": None},
                "labels": {
                    "style": {"fontSize": "12px"},
                },
                "lineColor": "#E5E7EB",
            },
            "yAxis": {
                "title": {
                    "text": "Part artificialisée (%)",
                    "style": {"fontSize": "12px", "color": "#6B7280"},
                },
                "labels": {
                    "format": "{value}%",
                    "style": {"fontSize": "11px", "color": "#6B7280"},
                },
                "gridLineColor": "#F3F4F6",
                "gridLineDashStyle": "Dash",
            },
            "tooltip": {
                "backgroundColor": "rgba(255, 255, 255, 0.95)",
                "borderColor": "#E5E7EB",
                "borderRadius": 8,
                "shadow": True,
                "useHTML": True,
                "headerFormat": '<div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #1F2937;">{point.key}</div>',  # noqa: E501
                "pointFormat": """
                    <div style="padding: 4px 0;">
                        <span style="color: #6B7280;">Part du territoire :</span>
                        <b style="color: #1F2937;">{point.y:.2f}%</b>
                    </div>
                    <div style="padding: 4px 0;">
                        <span style="color: #6B7280;">Surface :</span>
                        <b style="color: #1F2937;">{point.surface:,.1f} ha</b>
                    </div>
                """,
            },
            "plotOptions": {
                "column": {
                    "borderRadius": 3,
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:.2f}%<br/>({point.surface:,.0f} ha)",
                        "style": {
                            "fontSize": "10px",
                            "fontWeight": "600",
                            "textOutline": "none",
                            "color": "#6B7280",
                            "textAlign": "center",
                        },
                    },
                },
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
    """Version export du graphique de synthèse d'artificialisation"""

    @property
    def param(self):
        base_param = super().param

        return base_param | {
            "credits": OCSGE_CREDITS,
            "title": {
                **base_param.get("title", {}),
                "text": f"{self.title} (en %)",
            },
            "tooltip": {"enabled": False},
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
