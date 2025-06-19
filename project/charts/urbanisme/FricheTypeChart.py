from public_data.models import LandFricheType

from .BaseFricheChart import BaseFricheChart


class FricheTypeChart(BaseFricheChart):
    model = LandFricheType
    friche_field = "friche_type"
    title = "Type de friches"
    series_name = title
