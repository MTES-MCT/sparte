from public_data.models import LandFricheZoneActivite

from .BaseFricheChart import BaseFricheChart


class FricheZoneActiviteChart(BaseFricheChart):
    model = LandFricheZoneActivite
    friche_field = "friche_is_in_zone_activite"
    title = "Répartition par intersection avec une zone d'activité économique (en surface)"
    series_name = title

    def format_boolean_field(self, item):
        return "oui" if getattr(item, self.friche_field) else "non"

    @property
    def data_table(self):
        headers = [
            self.series_name,
            "Nombre de friches sans projet",
            "Surface totale des friches sans projet (ha)",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": self.format_boolean_field(item),
                    "data": [
                        self.format_boolean_field(item),
                        item.friche_sans_projet_count,
                        item.friche_sans_projet_surface,
                    ],
                }
                for item in self.data
            ],
        }

    @property
    def series(self):
        return [
            {
                "name": self.series_name,
                "data": [
                    {
                        "name": self.format_boolean_field(item),
                        "surface": item.friche_sans_projet_surface,
                        "count": item.friche_sans_projet_count,
                        "y": item.friche_sans_projet_surface,
                    }
                    for item in self.data
                    if item.friche_sans_projet_surface > 0
                ],
            }
        ]
