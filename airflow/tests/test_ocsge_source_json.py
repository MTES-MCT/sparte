import json


def test_ocsge_source_json_is_properly_formatted():
    """
    Chaque source doit contenir les clés suivantes:
    - difference
    - occupation_du_sol_et_zone_construite
    Chaque source doit contenir une clé "difference" pour chaque duo d'année de "occupation_du_sol_et_zone_construite"
    La clé "difference" doit être de la forme "année1_année2"
    """
    file_path = "include/ocsge/sources.json"
    data: dict = json.load(open(file_path))

    for source in data.values():
        assert isinstance(source, dict), "Chaque source doit être un objet json valide"
        source_keys = source.keys()
        assert "difference" in source_keys, "La clé 'difference' est manquante"
        assert (
            "occupation_du_sol_et_zone_construite" in source_keys
        ), "La clé 'occupation_du_sol_et_zone_construite' est manquante"

        # Récupérer les années (ex: 2019, 2022)
        occupation_du_sol_et_zone_construite_keys = list(source["occupation_du_sol_et_zone_construite"].keys())

        assert len(occupation_du_sol_et_zone_construite_keys) > 1, "Il doit y avoir au moins 2 années"

        # Vérifie que la différence est présente pour chaque duo d'année
        sorted_years = sorted(occupation_du_sol_et_zone_construite_keys)

        expected_difference_keys = []

        for year in sorted_years:
            try:
                next_year = sorted_years[sorted_years.index(year) + 1]
            except IndexError:
                break
            expected_difference_keys.append(f"{year}_{next_year}")

        for expected_difference_key in expected_difference_keys:
            assert (
                expected_difference_key in source["difference"].keys()
            ), f"La clé {expected_difference_key} est manquante"
