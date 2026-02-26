from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import INSEE_CREDITS
from public_data.models import LandDcEquipementsBpe

EQUIPEMENTS_CONFIG = [
    ("Médecins généralistes", "medecin_generaliste", "Santé"),
    ("Chirurgiens-dentistes", "chirurgien_dentiste", "Santé"),
    ("Infirmiers", "infirmier", "Santé"),
    ("Masseurs-kinésithérapeutes", "masseur_kinesitherapeute", "Santé"),
    ("Psychologues", "psychologue", "Santé"),
    ("Écoles maternelles", "ecole_maternelle", "Enseignement"),
    ("Écoles primaires", "ecole_primaire", "Enseignement"),
    ("Écoles élémentaires", "ecole_elementaire", "Enseignement"),
    ("Collèges", "college", "Enseignement"),
    ("Lycées gén. et techno.", "lycee_general_technologique", "Enseignement"),
    ("Lycées professionnels", "lycee_professionnel", "Enseignement"),
    ("Boulangeries", "boulangerie", "Commerces"),
    ("Supérettes", "superette", "Commerces"),
    ("Supermarchés", "supermarche", "Commerces"),
    ("Hypermarchés", "hypermarche", "Commerces"),
    ("Épiceries", "epicerie", "Commerces"),
    ("Coiffure", "coiffure", "Commerces"),
    ("Stations-service", "station_service", "Services"),
    ("Bornes recharge élec.", "borne_recharge_electrique", "Services"),
]


class DcEquipementsBpeChart(DiagnosticChart):
    name = "dc equipements bpe"

    @property
    def data(self):
        return LandDcEquipementsBpe.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).first()

    @property
    def param(self):
        d = self.data
        if not d:
            return super().param | {"series": []}

        categories = [label for label, _, _ in EQUIPEMENTS_CONFIG]
        values = [getattr(d, field, None) or 0 for _, field, _ in EQUIPEMENTS_CONFIG]

        return super().param | {
            "chart": {"type": "bar"},
            "title": {"text": f"Équipements et services - {self.land.name}"},
            "credits": INSEE_CREDITS,
            "xAxis": {"categories": categories},
            "yAxis": {"title": {"text": "Nombre"}},
            "tooltip": {
                "headerFormat": "<b>{point.key}</b><br/>",
                "pointFormat": "{series.name}: {point.y:,.0f}",
            },
            "legend": {"enabled": False},
            "plotOptions": {"bar": {"dataLabels": {"enabled": True, "format": "{point.y:,.0f}"}}},
            "series": [
                {
                    "name": "Équipements",
                    "data": values,
                    "color": "#6A6AF4",
                },
            ],
        }

    @property
    def data_table(self):
        d = self.data
        if not d:
            return None

        def fmt(v):
            return f"{v:,.0f}" if v else "-"

        return {
            "headers": ["Équipement", "Catégorie", "Nombre"],
            "rows": [
                {"name": "", "data": [label, cat, fmt(getattr(d, field, None))]}
                for label, field, cat in EQUIPEMENTS_CONFIG
            ],
        }
