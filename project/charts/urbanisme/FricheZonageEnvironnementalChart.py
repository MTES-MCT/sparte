from public_data.models import LandFricheZonageEnvironnementale

from .BaseFricheChart import BaseFricheChart


class FricheZonageEnvironnementalChart(BaseFricheChart):
    model = LandFricheZonageEnvironnementale
    friche_field = "friche_zonage_environnemental"
    title = "Intersection avec un zonage environnemental"
    series_name = "Type de zonage environnemental"
    colors = [
        "#FF5733",  # Rouge
        "#33FF57",  # Vert
        "#3357FF",  # Bleu
        "#F1C40F",  # Jaune
        "#8E44AD",  # Violet
    ]
