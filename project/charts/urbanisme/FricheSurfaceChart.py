from public_data.models import LandFricheSurfaceRank

from .BaseFricheChart import BaseFricheChart


class FricheSurfaceChart(BaseFricheChart):
    title = "Catégorie de taille de friche"
    series_name = title
    colors = [
        "#FF5733",  # Rouge
        "#33FF57",  # Vert
        "#3357FF",  # Bleu
        "#F1C40F",  # Jaune
        "#8E44AD",  # Violet
    ]

    def format_min_max_rank(self, item: LandFricheSurfaceRank) -> str:
        if item.friche_surface_percentile_rank == 1:
            return f"< {item.rank_max_surface:.2f} ha"
        if item.friche_surface_percentile_rank == 4:
            return f"> {item.rank_min_surface:.2f} ha"
        return f"[{item.rank_min_surface:.2f} - {item.rank_max_surface:.2f}] ha"

    @property
    def data(self):
        return LandFricheSurfaceRank.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
        ).order_by("-friche_count")

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
                    "name": self.format_min_max_rank(item),
                    "data": [
                        self.format_min_max_rank(item),
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
                        "name": self.format_min_max_rank(item),
                        "surface": item.friche_surface,
                        "y": item.friche_count,
                    }
                    for item in self.data
                    if item.friche_count > 0
                ],
            }
        ]
