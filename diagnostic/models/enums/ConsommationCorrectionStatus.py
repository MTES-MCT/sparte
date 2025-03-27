from django.db import models


class ConsommationCorrectionStatus(models.TextChoices):
    UNCHANGED = "UNCHANGED", "Inchangé"
    """
    Les données de consommation sont telles qu'elles sont dans la source
    """
    DIVISION = "DIVISION", "Division"
    """
    Les données de consommation ont été divisées par un coefficient
    de surface, sur la base des divisions observées dans le dernier COG.
    """
    FUSION = "FUSION", "Fusion"
    """
    Les données de consommation ont été fusionnées, sur la base des fusions
    observées dans le dernier COG.
    """
    COG_ERROR = "COG_ERROR", "Erreur COG"
    """
    Les données de consommation ont été divisiées ou fusionnées, en correction
    des données sources qui n'est pas conforme au précédent COG.
    """
    MISSING_FROM_SOURCE = "MISSING_FROM_SOURCE", "Manquant dans la source"
    """
    Les données de consommation ont été mises à 0 car elles sont absentes
    de la source.
    """
