import json
import logging

from django.core.management.base import BaseCommand

from public_data.management.commands.load_ocsge import CONFIG_PATH
from public_data.models import Departement
from public_data.storages import DataStorage

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    def check_departement_exists(self, departement_name):
        assert Departement.objects.filter(
            name=departement_name
        ).exists(), f"Departement {departement_name} does not exist"

    def is_valid_ocsge_layer_name(self, layer_name: str):
        return layer_name.isnumeric() and len(layer_name) == 4

    def is_valid_zone_construite_layer_name(self, layer_name: str):
        prefix_is_valid = "_zc" in layer_name

        if not prefix_is_valid:
            return False

        layer_name_without_prefix = layer_name.replace("_zc", "")

        return self.is_valid_ocsge_layer_name(layer_name_without_prefix)

    def is_valid_diff_layer_name(self, layer_name: str):
        prefix_is_valid = "_diff" in layer_name

        if not prefix_is_valid:
            return False

        layer_name_without_prefix = layer_name.replace("_diff", "")

        return all(self.is_valid_ocsge_layer_name(layer_name) for layer_name in layer_name_without_prefix.split("_"))

    def handle(self, *args, **options) -> None:  # noqa
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)

        for key, value in config.items():
            self.check_departement_exists(departement_name=key)

            zc_count = 0
            diff_count = 0
            ocsge_count = 0

            for key, value in value.items():
                layer_type = None

                valid_ocsge_layer_name = self.is_valid_ocsge_layer_name(layer_name=key)

                if valid_ocsge_layer_name:
                    layer_type = "ocsge"
                    ocsge_count += 1

                valid_zc_layer_name = self.is_valid_zone_construite_layer_name(layer_name=key)

                if valid_zc_layer_name:
                    layer_type = "zc"
                    zc_count += 1

                valid_diff_layer_name = self.is_valid_diff_layer_name(layer_name=key)

                if valid_diff_layer_name:
                    layer_type = "diff"
                    diff_count += 1

                assert (
                    valid_diff_layer_name or valid_ocsge_layer_name or valid_zc_layer_name
                ), f"Invalid layer name {key}"

                if isinstance(value, dict):
                    mapping = value.get("mapping")

                    assert mapping is not None, f"Missing mapping property {key}"

                    if layer_type == "diff":
                        mapping_fields = ["cs_old", "us_old", "cs_new", "us_new", "mpoly"]
                    elif layer_type == "zc":
                        mapping_fields = ["mpoly"]
                    elif layer_type == "ocsge":
                        mapping_fields = ["couverture", "usage", "mpoly"]

                    for field in mapping:
                        assert field in mapping_fields, f"Invalid mapping field {field} for layer {key}"

                    for mapping_field in mapping_fields:
                        assert (
                            mapping.get(mapping_field) is not None
                        ), f"Missing mapping field {mapping_field} for layer {key}"

                    path = value.get("path")

                    assert path is not None, f"Missing path property {key}"
                else:
                    path = value

                storage = DataStorage()
                assert storage.exists(path), f"Missing file on S3 {path}"

            assert (
                zc_count % 2 == 0
            ), f"Invalid number of zone construite layers for departement {key}. Found {zc_count}"
            assert ocsge_count % 2 == 0, f"Invalid number of ocsge layers for departement {key}. Found {ocsge_count}"
            assert (
                zc_count == ocsge_count
            ), f"Invalid number of zone construite layers for departement {key}. Found {zc_count}"
            assert (
                ocsge_count / 2 == diff_count
            ), f"Invalid number of diff layers for departement {key}. Found {diff_count}"

        logger.info("Config is valid :)")
