from public_data.models import LandFricheZonageEnvironnementale

from .BaseFricheChart import BaseFricheChart


class FricheZonageEnvironnementalChart(BaseFricheChart):
    model = LandFricheZonageEnvironnementale
    friche_field = "friche_zonage_environnemental"
    title = "Intersection avec un zonage environnemental"
    series_name = "Type de zonage environnemental"
