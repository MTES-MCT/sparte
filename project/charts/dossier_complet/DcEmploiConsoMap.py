from .DcBivariateConsoMap import PALETTE_PURPLE, DcBivariateConsoMap


class DcEmploiConsoMap(DcBivariateConsoMap):
    """Bivariate map: employment evolution × land consumption for activity."""

    name = "dc emploi conso map"
    indicator_key = "emploi"
    bivariate_colors = PALETTE_PURPLE
    conso_field = "activite"
    indicator_name = "Évolution annuelle de l'emploi"
    indicator_short = "évol. ann. emploi"
    indicator_unit = "%"
    indicator_gender = "f"

    verdicts = [
        [
            "Peu de consommation et emploi en recul : territoire en retrait mais économe en foncier.",
            "Peu de consommation avec un emploi stable : sobriété foncière dans un contexte modéré.",
            "Peu de consommation malgré une forte dynamique d'emploi : développement économique sobre.",
        ],
        [
            "Consommation modérée sans dynamique d'emploi : étalement peu justifié par l'activité économique.",
            "Consommation et emploi dans la moyenne du territoire.",
            "Consommation modérée accompagnée d'une bonne dynamique d'emploi.",
        ],
        [
            "Forte consommation sans création d'emploi : étalement non justifié par l'activité économique.",
            "Forte consommation pour un développement économique limité.",
            "Forte consommation accompagnée d'une forte dynamique d'emploi : croissance économique consommatrice.",
        ],
    ]
