from public_data.models import LandDcActiviteChomage

from .DcConsoComparisonBubbleChart import DcConsoComparisonBubbleChart


class DcEmploiConsoComparisonChart(DcConsoComparisonBubbleChart):
    indicator_model = LandDcActiviteChomage
    indicator_name = "Évolution de l'emploi"
    conso_field = "activite"
    conso_label = "Consommation activité relative à la surface (%)"
    start_field_11 = "actifs_occupes_15_64_11"
    end_field_16 = "actifs_occupes_15_64_16"
    start_field_16 = "actifs_occupes_15_64_16"
    end_field_22 = "actifs_occupes_15_64_22"
    x_axis_label = "Évolution de l'emploi (%)"
