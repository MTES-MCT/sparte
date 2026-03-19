from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcTourisme


class DcTourismeChart(DiagnosticChart):
    name = "dc tourisme"

    @property
    def data(self):
        return LandDcTourisme.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def param(self):
        d = self.data
        if not d:
            return super().param | {"series": []}

        etoiles = ["Non classé", "1★", "2★", "3★", "4★", "5★"]

        hotels = [
            d.hotels_non_classes or 0,
            d.hotels_1_etoile or 0,
            d.hotels_2_etoiles or 0,
            d.hotels_3_etoiles or 0,
            d.hotels_4_etoiles or 0,
            d.hotels_5_etoiles or 0,
        ]

        campings = [
            d.campings_non_classes or 0,
            d.campings_1_etoile or 0,
            d.campings_2_etoiles or 0,
            d.campings_3_etoiles or 0,
            d.campings_4_etoiles or 0,
            d.campings_5_etoiles or 0,
        ]

        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Hébergements touristiques - {self.land.name}"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": etoiles},
            "yAxis": {"title": {"text": "Nombre d'établissements"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "series": [
                {
                    "name": "Hôtels",
                    "data": hotels,
                    "color": "#6A6AF4",
                },
                {
                    "name": "Campings",
                    "data": campings,
                    "color": "#8ecac7",
                },
            ],
            "subtitle": {
                "text": (
                    f"Total : {int(d.hotels_total or 0)} hôtels ({int(d.hotels_chambres_total or 0)} chambres), "
                    f"{int(d.campings_total or 0)} campings ({int(d.campings_emplacements_total or 0)} emplacements)"
                ),
            },
        }

    @property
    def data_table(self):
        d = self.data
        if not d:
            return None

        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        return {
            "headers": ["Type", "Total", "Chambres/Emplacements"],
            "rows": [
                {"name": "", "data": ["Hôtels", fmt(d.hotels_total), fmt(d.hotels_chambres_total)]},
                {"name": "", "data": ["Campings", fmt(d.campings_total), fmt(d.campings_emplacements_total)]},
                {"name": "", "data": ["Villages vacances", fmt(d.villages_vacances), fmt(d.villages_vacances_lits)]},
                {
                    "name": "",
                    "data": ["Résidences de tourisme", fmt(d.residences_tourisme), fmt(d.residences_tourisme_lits)],
                },
                {
                    "name": "",
                    "data": ["Auberges de jeunesse", fmt(d.auberges_jeunesse), fmt(d.auberges_jeunesse_lits)],
                },
            ],
        }
