from public_data.models import LandFricheZoneActivite

from .BaseFricheChart import BaseFricheChart


class FricheZoneActiviteChart(BaseFricheChart):
    model = LandFricheZoneActivite
    friche_field = "friche_is_in_zone_activite"
    title = "Intersection avec une zone d'activité économique"
    series_name = title
    colors = [
        "#FF5733",  # Rouge
        "#33FF57",  # Vert
        "#3357FF",  # Bleu
        "#F1C40F",  # Jaune
        "#8E44AD",  # Violet
    ]

    def format_boolean_field(self, item):
        return "oui" if getattr(item, self.friche_field) else "non"

    @property
    def data_table(self):
        headers = [
            self.series_name,
            "Nombre de friches",
            "Surface totale des friches (ha)",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": self.format_boolean_field(item),
                    "data": [
                        self.format_boolean_field(item),
                        item.friche_count,
                        item.friche_surface,
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
                        "surface": item.friche_surface,
                        "count": item.friche_count,
                        "y": item.friche_count,
                    }
                    for item in self.data
                    if item.friche_count > 0
                ],
            }
        ]
