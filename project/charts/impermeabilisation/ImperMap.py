from project.charts.base_charts.BaseOcsgeMap import BaseOcsgeMap, BaseOcsgeMapExport
from public_data.models import LandImperStockIndex


class ImperMap(BaseOcsgeMap):
    stock_index_model = LandImperStockIndex
    theme_label = "imperméabilisation"
    theme_label_cap = "Imperméabilisation"
    reverse_label = "Désimperméabilisation"
    stock_label = "Part imperméabilisée"
    surface_label = "Surface imperméabilisée"
    rate_label = "Taux d'imperméabilisation"
    flux_percent_key = "flux_imper_percent"


class ImperMapExport(BaseOcsgeMapExport, ImperMap):
    export_height = 800
