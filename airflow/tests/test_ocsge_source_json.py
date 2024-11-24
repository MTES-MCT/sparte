import json


def test_ocsge_source_json_is_properly_formatted():
    file_path = "include/ocsge/sources.json"
    data: dict = json.load(open(file_path))

    for source in data.values():
        assert isinstance(source, dict)
        source_keys = source.keys()
        assert "difference" in source_keys
        assert "occupation_du_sol_et_zone_construite" in source_keys

        # Récupérer les années (ex: 2019, 2022)
        occupation_du_sol_et_zone_construite_keys = source["occupation_du_sol_et_zone_construite"].keys()

        # Vérifie que la différence est présente pour chaque duo d'année
        # TODO : mettre à jour cette logique lorsqu'il y aura plus de 2 années
        expected_difference_key = "_".join(sorted(occupation_du_sol_et_zone_construite_keys))

        assert expected_difference_key in source["difference"].keys()
