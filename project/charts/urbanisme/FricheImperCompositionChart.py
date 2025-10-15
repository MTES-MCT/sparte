from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    DEFAULT_VALUE_DECIMALS,
    IMPERMEABILISATION_COLOR,
    LEGEND_NAVIGATION_EXPORT,
    NON_IMPERMEABLE_COLOR,
    OCSGE_CARTOFRICHES_CREDITS,
)
from public_data.models import LandFriche
from public_data.models.urbanisme import LandFricheStatut


class FricheImperCompositionChart(DiagnosticChart):
    name = "Composition imperméabilisation des friches"

    def get_friches(self):
        """Retourne les friches sans projet du territoire."""
        return LandFriche.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            friche_statut=LandFricheStatut.StatutChoices.FRICHE_SANS_PROJET,
        )

    @property
    def data(self):
        friches = self.get_friches()

        total_surface = sum(f.surface or 0 for f in friches) / 10000
        total_surface_imper = sum(f.surface_imper or 0 for f in friches)
        total_surface_non_imper = total_surface - total_surface_imper

        return {
            "total_surface": total_surface,
            "surface_imper": total_surface_imper,
            "surface_non_imper": total_surface_non_imper,
        }

    @property
    def data_table(self):
        headers = [
            "Type",
            "Surface (ha)",
            "Pourcentage (%)",
        ]

        data = self.data
        total = data["total_surface"]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "Imperméabilisé",
                    "data": [
                        "Imperméabilisé",
                        round(data["surface_imper"], DEFAULT_VALUE_DECIMALS),
                        round(data["surface_imper"] / total * 100, 2) if total > 0 else 0,
                    ],
                },
                {
                    "name": "Non imperméabilisé",
                    "data": [
                        "Non imperméabilisé",
                        round(data["surface_non_imper"], DEFAULT_VALUE_DECIMALS),
                        round(data["surface_non_imper"] / total * 100, 2) if total > 0 else 0,
                    ],
                },
            ],
        }

    @property
    def series(self):
        data = self.data
        return [
            {
                "name": "Composition imperméabilisation",
                "data": [
                    {
                        "name": "Imperméabilisé",
                        "y": data["surface_imper"],
                        "color": IMPERMEABILISATION_COLOR,
                    },
                    {
                        "name": "Non imperméabilisé",
                        "y": data["surface_non_imper"],
                        "color": NON_IMPERMEABLE_COLOR,
                    },
                ],
            }
        ]

    @property
    def param(self):
        return super().param | {
            "title": {"text": "Part imperméabilisée des friches sans projet (en surface)"},
            "series": self.series,
            "chart": {"type": "pie"},
            "tooltip": {
                "valueSuffix": " ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "{point.percentage:.1f}% ({point.y:,.1f} ha)",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "plotOptions": {
                "pie": {
                    "dataLabels": {
                        "enabled": True,
                        "overflow": "justify",
                        "format": "{point.name} - {point.percentage:.2f}%",
                        "style": {
                            "textOverflow": "clip",
                            "width": "100px",
                        },
                    },
                }
            },
        }


class FricheImperCompositionChartExport(FricheImperCompositionChart):
    def get_years_text(self):
        """Retourne le texte des années d'imperméabilisation."""
        friches = self.get_friches()

        # Collecter toutes les années uniques
        all_years = set()
        for friche in friches:
            if friche.years_imper:
                all_years.update(friche.years_imper)

        if not all_years:
            return ""

        sorted_years = sorted(all_years)
        years_str = ", ".join(str(year) for year in sorted_years)
        return f" ({years_str})"

    @property
    def param(self):
        years_text = self.get_years_text()
        title_text = (
            f"Part imperméabilisée des friches sans projet (en surface) "
            f"sur le territoire de {self.land.name}{years_text}"
        )
        return super().param | {
            "title": {"text": title_text},
            "credits": OCSGE_CARTOFRICHES_CREDITS,
            "legend": {
                **super().param.get("legend", {}),
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "plotOptions": {
                **super().param["plotOptions"],
                "pie": {
                    **super().param["plotOptions"]["pie"],
                    "dataLabels": {
                        **super().param["plotOptions"]["pie"]["dataLabels"],
                        "format": "<b>{point.name}</b><br/>{point.y:,.1f} ha ({point.percentage:.1f}%)",
                    },
                },
            },
        }
