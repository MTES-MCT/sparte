import json

from include.domain.data.ocsge.enums import DatasetName


def create_configs_from_sources(sources: dict) -> list:
    confs = []

    for departement in sources:
        occupation_du_sol_et_zone_construite = sources[departement]["occupation_du_sol_et_zone_construite"]
        for year in occupation_du_sol_et_zone_construite:
            url = occupation_du_sol_et_zone_construite[year]
            confs.append(
                {
                    "years": [int(year)],
                    "departement": departement,
                    "dataset": DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE,
                    "file_format": "gpkg" if "GPKG" in url else "shp",
                }
            )

        difference = sources[departement]["difference"]
        for year in difference:
            url = difference[year]
            confs.append(
                {
                    "years": list(map(int, year.split("_"))),
                    "departement": departement,
                    "dataset": DatasetName.DIFFERENCE,
                    "file_format": "gpkg" if "GPKG" in url else "shp",
                }
            )
        if "artif" not in sources[departement]:
            continue
        artif = sources[departement]["artif"]
        for year in artif:
            url = artif[year]
            confs.append(
                {
                    "years": [int(year)],
                    "departement": departement,
                    "dataset": DatasetName.ARTIF,
                    "file_format": "gpkg" if "GPKG" in url else "shp",
                }
            )

    conf_as_str = [json.dumps(conf) for conf in confs]

    return conf_as_str
