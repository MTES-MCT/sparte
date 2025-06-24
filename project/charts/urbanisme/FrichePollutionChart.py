from public_data.models import LandFrichePollution

from .BaseFricheChart import BaseFricheChart


class FrichePollutionChart(BaseFricheChart):
    model = LandFrichePollution
    friche_field = "friche_sol_pollution"
    title = "Répartition par niveau de pollution (en surface)"
    series_name = "Type de pollution"
