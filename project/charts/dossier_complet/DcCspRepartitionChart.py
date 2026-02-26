from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcCategoriesSocioprofessionnelles


class DcCspRepartitionChart(DiagnosticChart):
    name = "dc csp repartition"

    @property
    def data(self):
        return LandDcCategoriesSocioprofessionnelles.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def param(self):
        d = self.data
        if not d:
            return super().param | {"series": []}

        csp_data = [
            ("Agriculteurs", d.pop_15_plus_agriculteurs_22 or 0),
            ("Artisans, commerçants", d.pop_15_plus_artisans_commercants_22 or 0),
            ("Cadres", d.pop_15_plus_cadres_22 or 0),
            ("Prof. intermédiaires", d.pop_15_plus_prof_intermediaires_22 or 0),
            ("Employés", d.pop_15_plus_employes_22 or 0),
            ("Ouvriers", d.pop_15_plus_ouvriers_22 or 0),
            ("Retraités", d.pop_15_plus_retraites_22 or 0),
            ("Autres inactifs", d.pop_15_plus_autres_inactifs_22 or 0),
        ]

        return super().param | {
            "chart": {"type": "pie"},
            "title": {"text": f"Répartition par CSP - {self.land.name} (2022)"},
            "credits": INSEE_CREDITS,
            "tooltip": {
                "pointFormat": "{series.name}: <b>{point.y:,.0f}</b> ({point.percentage:.1f}%)",
            },
            "plotOptions": {
                "pie": {
                    "allowPointSelect": True,
                    "cursor": "pointer",
                    "dataLabels": {
                        "enabled": True,
                        "format": "<b>{point.name}</b>: {point.percentage:.1f} %",
                    },
                }
            },
            "series": [
                {
                    "name": "Population",
                    "colorByPoint": True,
                    "data": [{"name": name, "y": val} for name, val in csp_data],
                }
            ],
        }

    @property
    def data_table(self):
        d = self.data
        if not d:
            return None

        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        total = d.pop_15_plus_22 or 0

        def pct(v):
            return f"{(v or 0) / total * 100:.1f}%" if total else "-"

        csp_rows = [
            ("Agriculteurs", d.pop_15_plus_agriculteurs_22),
            ("Artisans, commerçants", d.pop_15_plus_artisans_commercants_22),
            ("Cadres", d.pop_15_plus_cadres_22),
            ("Prof. intermédiaires", d.pop_15_plus_prof_intermediaires_22),
            ("Employés", d.pop_15_plus_employes_22),
            ("Ouvriers", d.pop_15_plus_ouvriers_22),
            ("Retraités", d.pop_15_plus_retraites_22),
            ("Autres inactifs", d.pop_15_plus_autres_inactifs_22),
        ]

        return {
            "headers": ["CSP", "Population", "Part"],
            "rows": [{"name": "", "data": [label, fmt(val), pct(val)]} for label, val in csp_rows],
        }
