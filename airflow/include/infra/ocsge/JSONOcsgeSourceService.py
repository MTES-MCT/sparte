import json

from include.domain.data.ocsge.BaseOcsgeSourceService import BaseOcsgeSourceService
from include.domain.data.ocsge.entities import OcsgeSource
from include.domain.data.ocsge.enums import DatasetName, SourceName


class JSONOcsgeSourceService(BaseOcsgeSourceService):
    def __init__(self, json_content: str):
        self.json_content = json.loads(json_content)

    def get(self, years: list[int], departement: str, type: SourceName) -> OcsgeSource:
        if departement not in self.json_content:
            raise ValueError(f"Le département {departement} n'existe pas dans les sources OCSGE")

        is_difference = type == SourceName.DIFFERENCE
        is_occupation_du_sol_or_zone_construite = type in [
            SourceName.OCCUPATION_DU_SOL,
            SourceName.ZONE_CONSTRUITE,
        ]

        year_count = len(years)

        if is_difference and year_count != 2:
            raise ValueError("La source de type DIFFERENCE ne peut être appelée qu'avec deux années")
        elif is_occupation_du_sol_or_zone_construite and year_count != 1:
            raise ValueError(
                "La source de type OCCUPATION_DU_SOL ou ZONE_CONSTRUITE ne peut être appelée qu'avec une année"
            )

        dataset_key = None

        if type in [SourceName.OCCUPATION_DU_SOL, SourceName.ZONE_CONSTRUITE]:
            dataset_key = DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE
        elif type == SourceName.DIFFERENCE:
            dataset_key = DatasetName.DIFFERENCE
        else:
            error_message = f"Type de source inconnu : {type}. Valeurs possibles : {list(SourceName)}"
            raise ValueError(error_message)

        years_key = "_".join(map(str, years))

        years_in_json = self.json_content[departement][dataset_key]

        if years_key not in years_in_json:
            raise ValueError(
                f"L'année(s) {years_key} n'existe(nt) pas dans les sources OCSGE pour le département {departement}"
            )

        url = years_in_json[years_key]

        return OcsgeSource(
            type=type,
            url=url,
            years=years,
            departement=departement,
        )

    def get_all(self):
        sources = []

        for departement, datasets in self.json_content.items():
            for dataset_key, years in datasets.items():
                for years_key, url in years.items():
                    years = list(map(int, years_key.split("_")))
                    _type = (
                        SourceName.OCCUPATION_DU_SOL
                        if dataset_key == DatasetName.OCCUPATION_DU_SOL_ET_ZONE_CONSTRUITE
                        else SourceName.DIFFERENCE
                    )

                    sources.append(
                        OcsgeSource(
                            type=_type,
                            url=url,
                            years=years,
                            departement=departement,
                        )
                    )

        return sources
