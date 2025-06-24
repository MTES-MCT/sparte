from public_data.models import LandFricheZonageEnvironnementale

from .BaseFricheChart import BaseFricheChart


class FricheZonageEnvironnementalChart(BaseFricheChart):
    model = LandFricheZonageEnvironnementale
    friche_field = "friche_zonage_environnemental"
    title = "Répartition par intersection ou proximité avec un zonage environnemental (en surface)"
    series_name = "Type de zonage environnemental"
