import csv
import datetime
import logging

from django.core.management.base import BaseCommand

from public_data.models import Sudocuh, SudocuhEpci
from public_data.storages import DataStorage

logger = logging.getLogger("management.commands")


def empty_string_to_none(value: str):
    if not isinstance(value, str):
        raise ValueError(f"Value must be a string, got {type(value)}")

    if not value.strip():
        return None

    return value


def parse_date(str_date: str, format: str = "%m/%d/%y"):
    return datetime.datetime.strptime(str_date, format).date()


def parse_boolean(value: str):
    if value.lower() == "oui":
        return True
    elif value.lower() == "non":
        return False

    raise ValueError(f"Unknown boolean value {value}")


def convert_km2_to_ha(value: str) -> float:
    return float(value) * 100


def parse_commune_insee(value: str) -> str:
    return value.zfill(5)


class Command(BaseCommand):
    """
    Data downloaded from:
    https://www.data.gouv.fr/en/datasets/planification-nationale-des-documents-durbanisme-plu-plui-cc-rnu-donnees-sudocuh-dernier-etat-des-lieux-annuel-au-31-decembre-2023/ # noqa: E501
    """

    help = "Import Sudocuh data from a csv file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--sudocuh-file",
            type=str,
            default="sudocuh_cog_2023.csv",
        )
        parser.add_argument(
            "--sudocuh-epci-file",
            type=str,
            default="sudocuh_epci_cog_2023.csv",
        )

    def import_communes_file(self, options):
        storage = DataStorage()
        sudocuh_file = storage.open(options.get("sudocuh_file"), "rb").read()
        csv_file_as_list = sudocuh_file.decode("utf-8").split("\r\n")
        headers = csv_file_as_list.pop(0).split(";")

        date_fields = [
            "prescription_du_en_vigueur",
            "approbation_du_en_vigueur",
            "executoire_du_en_vigueur",
            "prescription_proc_en_cours",
        ]

        area_field = "superficie"

        logger.info("Deleting previous Sudocuh data")

        count, _ = Sudocuh.objects.all().delete()

        logger.info(f"Deleted {count} previous Sudocuh data")

        reader = csv.reader(csv_file_as_list, delimiter=";")
        count = len(csv_file_as_list)
        logger.info(f"Importing {count} Sudocuh data")

        objects_to_create = []

        for row in reader:
            data = dict(zip(headers, row))

            data = {key: empty_string_to_none(value) for key, value in data.items()}

            for column in date_fields:
                data[column] = parse_date(str_date=data[column]) if data[column] else None

            if data[area_field] is None:
                logger.warning(f"Empty superficie field for {data['nom_commune']}, defaulting to 0")

            data["code_insee"] = parse_commune_insee(data["code_insee"])
            data[area_field] = convert_km2_to_ha(value=data[area_field]) if data[area_field] else 0

            objects_to_create.append(Sudocuh(**data))

        created_sudocuh = Sudocuh.objects.bulk_create(objects_to_create)

        logger.info(f"Created {len(created_sudocuh)} Sudocuh data")

    def import_epci_file(self, options):
        storage = DataStorage()
        sudocuh_epci_file = storage.open(options.get("sudocuh_epci_file"), "rb").read()
        csv_file_as_list = sudocuh_epci_file.decode("utf-8").split("\n")
        headers = csv_file_as_list.pop(0).split(";")

        date_field = "date_creation_epci"

        boolean_fields = [
            "epci_interdepartemental",
            "competence_plan",
            "competence_scot",
            "competence_plh",
            "obligation_plh",
        ]

        area_field = "insee_superficie"

        logger.info("Deleting previous Sudocuh EPCI data")

        count, _ = SudocuhEpci.objects.all().delete()

        logger.info(f"Deleted {count} previous Sudocuh EPCI data")

        reader = csv.reader(csv_file_as_list, delimiter=";")
        count = len(csv_file_as_list)
        logger.info(f"Importing {count} Sudocuh EPCI data")

        objects_to_create = []

        for row in reader:
            data = dict(zip(headers, row))

            data = {key: empty_string_to_none(value) for key, value in data.items()}
            data[date_field] = parse_date(data[date_field]) if data[date_field] else None
            data[area_field] = convert_km2_to_ha(data[area_field])

            for field in boolean_fields:
                data[field] = parse_boolean(data[field])

            objects_to_create.append(SudocuhEpci(**data))

        created_sudocuh = SudocuhEpci.objects.bulk_create(objects_to_create)

        logger.info(f"Created {len(created_sudocuh)} Sudocuh EPCI data")

    def handle(self, *args, **options):
        storage = DataStorage()
        filename = options.get("sudocuh_file")
        filename_epci = options.get("sudocuh_epci_file")

        if not storage.exists(filename):
            raise FileNotFoundError(f"File {filename} not found on S3")

        if not storage.exists(filename_epci):
            raise FileNotFoundError(f"File {filename_epci} not found on S3")

        logger.info(f"Loading Sudocuh data from S3 file {filename} and {filename_epci}")

        self.import_communes_file(options)
        self.import_epci_file(options)
