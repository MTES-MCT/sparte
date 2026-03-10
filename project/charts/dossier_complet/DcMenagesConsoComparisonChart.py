from public_data.models import LandDcMenages

from .DcConsoComparisonBubbleChart import DcConsoComparisonBubbleChart


class DcMenagesConsoComparisonChart(DcConsoComparisonBubbleChart):
    indicator_model = LandDcMenages
    indicator_name = "Évolution du nombre de ménages"
    conso_field = "habitat"
    conso_label = "Consommation habitat relative à la surface (%)"
    start_field_11 = "menages_11"
    end_field_16 = "menages_16"
    start_field_16 = "menages_16"
    end_field_22 = "menages_22"
    x_axis_label = "Évolution du nombre de ménages (%)"


class DcMenagesConsoComparisonChartExport(DcMenagesConsoComparisonChart):
    pass
