from public_data.models import LandDcLogement

from .DcConsoComparisonBubbleChart import DcConsoComparisonBubbleChart


class DcLogementConsoComparisonChart(DcConsoComparisonBubbleChart):
    indicator_model = LandDcLogement
    indicator_name = "Évolution du parc de logements"
    conso_field = "habitat"
    conso_label = "Consommation habitat relative à la surface (%)"
    start_field_11 = "logements_11"
    end_field_16 = "logements_16"
    start_field_16 = "logements_16"
    end_field_22 = "logements_22"
    x_axis_label = "Évolution du parc de logements (%)"
