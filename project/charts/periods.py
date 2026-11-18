"""Aides à la rédaction des libellés de graphiques (périodes, articles).

Les données de consommation sont annuelles : une période « de 2011 à 2020 »
couvre les années 2011 à 2020 incluses, soit du 1er janvier 2011 au
1er janvier 2021. Ces fonctions ne servent qu'à l'affichage.
"""


def conso_period_short(start_year, end_year) -> str:
    return f"1er janv. {int(start_year)} – 1er janv. {int(end_year) + 1}"


def conso_period_long(start_year, end_year) -> str:
    return f"du 1er janvier {int(start_year)} au 1er janvier {int(end_year) + 1}"


def first_january(year) -> str:
    """Date d'un stock annuel (population, ménages…), mesuré au 1er janvier de l'année."""
    return f"1er janv. {int(year)}"


def with_definite_article(label: str) -> str:
    """« Évolution de la population » -> « l'évolution de la population »,
    « Taux de résidences secondaires » -> « le taux de résidences secondaires »."""
    text = label[0].lower() + label[1:]
    return f"l'{text}" if text[0] in "aeiouyhéèêàâîôû" else f"le {text}"
