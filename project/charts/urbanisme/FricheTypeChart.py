from public_data.models import LandFricheType

from .BaseFricheChart import BaseFricheChart


class FricheTypeChart(BaseFricheChart):
    model = LandFricheType
    friche_field = "friche_type"
    title = "Type de friches"
    series_name = title
    colors = [
        "#FF5733",  # Rouge
        "#33FF57",  # Vert
        "#3357FF",  # Bleu
        "#F1C40F",  # Jaune
        "#8E44AD",  # Violet
    ]
