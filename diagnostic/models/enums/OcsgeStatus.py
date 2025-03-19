from django.db import models


class OcsgeStatus(models.TextChoices):
    COMPLETE_UNIFORM = "COMPLETE_UNIFORM", "Complet et uniforme"
    """
    All cities of the project have OCS GE data for the selected millésimes,
    and the cities spreads over only one departement. This definition could
    evolve in the future if two departements have the same millésimes
    available, and the code allow for that verification.
    """

    COMPLETE_NOT_UNIFORM = "COMPLETE_NOT_UNIFORM", "Complet mais non uniforme"
    """
    All cities of the project have OCS GE data for the selected millésimes
    but the cities spreads over more than one departement.
    """

    PARTIAL = "PARTIAL", "Partiel"
    """
    At least one city of the project have OCS GE data for the selected
    millésimes.
    """

    NO_DATA = "NO_DATA", "Aucune donnée"
    """
    0 city of the project have OCS GE data for the selected millésimes.
    """

    UNDEFINED = "UNDEFINED", "Non défini"
