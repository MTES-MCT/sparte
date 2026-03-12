from .DcBivariateConsoMap import PALETTE_TEAL, DcBivariateConsoMap


class DcMenagesConsoMap(DcBivariateConsoMap):
    """Bivariate map: household evolution × land consumption."""

    name = "dc menages conso map"
    indicator_key = "menages"
    bivariate_colors = PALETTE_TEAL
    conso_field = "habitat"
    indicator_name = "Évolution du nombre de ménages"
    indicator_short = "évolution annuelle ménages"
    indicator_unit = "%"
    indicator_gender = "f"

    verdicts = [
        [
            "Peu de consommation et faible croissance des ménages : territoire stable et sobre.",
            "Peu de consommation avec une croissance modérée des ménages : urbanisme bien dimensionné.",
            "Peu de consommation malgré une forte croissance des ménages : densification réussie.",
        ],
        [
            "Consommation modérée mais peu de ménages supplémentaires : étalement peu justifié par les besoins.",
            "Consommation et croissance des ménages dans la moyenne du territoire.",
            "Consommation modérée pour une forte croissance des ménages : réponse adaptée aux besoins.",
        ],
        [
            "Forte consommation sans croissance significative des ménages : l'étalement ne répond pas à un besoin.",
            "Forte consommation pour une croissance modérée des ménages : étalement disproportionné.",
            "Forte consommation accompagnée d'une forte croissance des ménages : dynamique consommatrice.",
        ],
    ]
