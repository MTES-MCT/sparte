from .DcBivariateConsoMap import PALETTE_BLUE, DcBivariateConsoMap


class DcLogementConsoMap(DcBivariateConsoMap):
    """Bivariate map: housing stock evolution × land consumption."""

    name = "dc logement conso map"
    indicator_key = "logement"
    bivariate_colors = PALETTE_BLUE
    conso_field = "habitat"
    indicator_name = "Évolution annuelle du parc de logements"
    indicator_short = "évol. ann. logements"
    indicator_unit = "%"
    indicator_gender = "f"

    verdicts = [
        [
            "Peu de consommation et faible construction : territoire à faible dynamique immobilière.",
            "Peu de consommation avec une construction modérée : urbanisme maîtrisé.",
            "Peu de consommation malgré une forte construction : densification exemplaire.",
        ],
        [
            "Consommation modérée pour une faible construction : étalement sans réelle demande.",
            "Consommation et construction dans la moyenne : situation intermédiaire.",
            "Consommation modérée accompagnée d'une forte construction : réponse aux besoins.",
        ],
        [
            "Forte consommation sans construction significative : étalement non justifié par le logement.",
            "Forte consommation pour une construction modérée : étalement disproportionné.",
            "Forte consommation avec forte construction : dynamique immobilière consommatrice d'espaces.",
        ],
    ]
