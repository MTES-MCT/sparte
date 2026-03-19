from project.charts.base_charts.BaseOcsgeMap import BaseOcsgeMap, BaseOcsgeMapExport
from public_data.models import LandArtifStockIndex


class ArtifMap(BaseOcsgeMap):
    stock_index_model = LandArtifStockIndex
    theme_label = "artificialisation"
    theme_label_cap = "Artificialisation"
    reverse_label = "D\u00e9sartificialisation"
    stock_label = "Part artificialis\u00e9e"
    surface_label = "Surface artificialis\u00e9e"
    rate_label = "Taux d'artificialisation"
    flux_percent_key = "flux_artif_percent"


class ArtifMapExport(BaseOcsgeMapExport, ArtifMap):
    export_height = 600
