from public_data.models import LandFricheZonageType

from .BaseFricheChart import BaseFricheChart


class FricheZonageTypeChart(BaseFricheChart):
    model = LandFricheZonageType
    friche_field = "friche_type_zone"
    title = "Répartition par intersection avec un zonage d'urbanisme (en surface)"
    series_name = "Type de zonage"
