import csv
import datetime
import logging

import click
from django.core.management.base import BaseCommand

from public_data.models import Sudocuh
from public_data.storages import DataStorage

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    """
    Data downloaded from:
    https://www.data.gouv.fr/en/datasets/planification-nationale-des-documents-durbanisme-plu-plui-cc-rnu-donnees-sudocuh-dernier-etat-des-lieux-annuel-au-31-decembre-2023/ # noqa: E501
    """

    help = "Import Sudocuh data from a csv file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--filename",
            type=str,
            help="filename you want to import",
            default="sudocuh_cog_2023.csv",
        )
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Skip confirmation",
            required=False,
            default=False,
        )
        parser.add_argument(
            "--date-format",
            type=str,
            help="Date format to parse",
            required=False,
            default="%m/%d/%y",
        )
        parser.add_argument(
            "--superficie-unit",
            type=str,
            help="Unit of the superficie",
            required=False,
            default="km2",
            choices=["km2", "ha", "m2"],
        )

    def empty_string_to_none(self, value: str):
        if value == "":
            return None
        return value

    def parse_date(self, str_date: str, format: str):
        expected_format = "%m/%d/%y"
        return datetime.datetime.strptime(str_date, expected_format).date()

    def convert_superficie_to_ha(self, value: str, unit: str) -> float:
        if unit == "km2":
            return float(value) * 100
        if unit == "m2":
            return float(value) / 10000
        return float(value)

    def handle(self, *args, **options):
        instructions = """
        Before the import, make sure that the file is in the right format:
        - The file must be a .csv file
        - The columns must be renamed to match the Sudoch model's columns
        - The value "Aucun" must be replaced by None (no value)
            - Replace regex (vscode): ;Aucun; to ;;
            - Attention, there is a commune named "Aucun"
        - The numeric values must have their commas replaced by dots
            - Replace regex (vscode): (,)(\d+) to .$2  # noqa: W605
        - Spaces in numeric values must be removed
            - Replace regex (vscode): (\s)(\d+) to $2  # noqa: W605
        - Verify the data format matches the parser's date format
        - Verify the superficie unit matches the superficie unit option
        """

        click.echo(instructions)

        if not options.get("yes"):
            click.confirm("Do you want to continue?", abort=True)

        storage = DataStorage()
        filename = options.get("filename")

        if not storage.exists(filename):
            raise FileNotFoundError(f"File {filename} not found on S3")

        logger.info(f"Loading Sudocuh data from S3 file {filename}")

        # open as binary from S3 to avoid decoding issues
        sudocuh_file = storage.open(options.get("filename"), "rb").read()

        logger.info("Sudocuh data loaded")

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

            data = {key: self.empty_string_to_none(value) for key, value in data.items()}

            for column in date_fields:
                data[column] = (
                    self.parse_date(
                        str_date=data[column],
                        format=options.get("date_format"),
                    )
                    if data[column]
                    else None
                )

            if data[area_field] is None:
                logger.warning(f"Empty superficie field for {data['nom_commune']}, defaulting to 0")

            data[area_field] = (
                self.convert_superficie_to_ha(
                    value=data[area_field],
                    unit=options.get("superficie_unit"),
                )
                if data[area_field]
                else 0
            )

            objects_to_create.append(Sudocuh(**data))

        created_sudocuh = Sudocuh.objects.bulk_create(objects_to_create)

        logger.info(f"Created {len(created_sudocuh)} Sudocuh data")
