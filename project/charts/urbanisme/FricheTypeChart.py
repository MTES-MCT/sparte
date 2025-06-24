from public_data.models import LandFricheType

from .BaseFricheChart import BaseFricheChart


class FricheTypeChart(BaseFricheChart):
    model = LandFricheType
    friche_field = "friche_type"
    title = "Répartition par type (en surface)"
    series_name = title
