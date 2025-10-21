from enum import StrEnum


class DatasetName(StrEnum):
    OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE = "occupation_du_sol_et_zone_construite"
    DIFFERENCE = "difference"
    ARTIF = "artif"
    ARTIF_DIFFERENCE = "artif_difference"


class SourceName(StrEnum):
    OCCUPATION_DU_SOL = "occupation_du_sol"
    ZONE_CONSTRUITE = "zone_construite"
    DIFFERENCE = "difference"
    ARTIF = "artif"
    ARTIF_DIFFERENCE = "artif_difference"
