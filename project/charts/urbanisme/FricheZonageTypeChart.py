from public_data.models import LandFricheZonageType

from .BaseFricheChart import BaseFricheChart


class FricheZonageTypeChart(BaseFricheChart):
    model = LandFricheZonageType
    friche_field = "friche_type_zone"
    title = "Intersection avec un zonage d'urbanisme"
    series_name = "Type de zonage"
