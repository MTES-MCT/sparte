from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcRevenusPauvrete


class DcRevenusPauvreteChart(DiagnosticChart):
    name = "dc revenus pauvrete"

    @property
    def data(self):
        return LandDcRevenusPauvrete.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def param(self):
        d = self.data
        if not d:
            return super().param | {"series": []}

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Revenus et pauvreté - {self.land.name}"},
            "credits": INSEE_CREDITS,
            "xAxis": {
                "categories": [
                    "Médiane niveau de vie",
                    "1er décile (D1)",
                    "9e décile (D9)",
                ],
            },
            "yAxis": {"title": {"text": "Euros (€)"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f} €",
            },
            "legend": {"enabled": False},
            "series": [
                {
                    "name": "Montant",
                    "data": [
                        d.mediane_niveau_vie or 0,
                        d.decile_1 or 0,
                        d.decile_9 or 0,
                    ],
                    "color": "#6A6AF4",
                },
            ],
            "subtitle": {
                "text": (
                    f"Taux de pauvreté : {d.taux_pauvrete:.1f}% | "
                    f"Part des ménages imposés : {d.part_menages_imposes:.1f}% | "
                    f"Rapport interdécile (D9/D1) : {d.rapport_interdecile:.1f}"
                )
                if d.taux_pauvrete is not None
                else "",
            },
        }

    @property
    def data_table(self):
        d = self.data
        if not d:
            return None

        def fmt(v):
            return f"{v:,.0f}" if v is not None else "-"

        def pct(v):
            return f"{v:.1f}%" if v is not None else "-"

        return {
            "headers": ["Indicateur", "Valeur"],
            "rows": [
                {"name": "", "data": ["Médiane du niveau de vie (€)", fmt(d.mediane_niveau_vie)]},
                {"name": "", "data": ["1er décile D1 (€)", fmt(d.decile_1)]},
                {"name": "", "data": ["9e décile D9 (€)", fmt(d.decile_9)]},
                {
                    "name": "",
                    "data": [
                        "Rapport interdécile D9/D1",
                        f"{d.rapport_interdecile:.1f}" if d.rapport_interdecile else "-",
                    ],
                },
                {"name": "", "data": ["Taux de pauvreté", pct(d.taux_pauvrete)]},
                {"name": "", "data": ["Part des ménages imposés", pct(d.part_menages_imposes)]},
                {"name": "", "data": ["Nb ménages fiscaux", fmt(d.nb_menages_fiscaux)]},
            ],
        }
