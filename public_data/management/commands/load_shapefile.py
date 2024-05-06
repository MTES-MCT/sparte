import logging
import subprocess
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from public_data.models import (
    ArtificialArea,
    Cerema,
    DataSource,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)
from public_data.shapefile import ShapefileFromSource

logger = logging.getLogger("management.commands")

source_to_table_map = {
    DataSource.DatasetChoices.OCSGE: {
        DataSource.DataNameChoices.OCCUPATION_DU_SOL: Ocsge._meta.db_table,
        DataSource.DataNameChoices.DIFFERENCE: OcsgeDiff._meta.db_table,
        DataSource.DataNameChoices.ZONE_CONSTRUITE: ZoneConstruite._meta.db_table,
        DataSource.DataNameChoices.ZONE_ARTIFICIELLE: ArtificialArea._meta.db_table,
    },
    DataSource.DatasetChoices.MAJIC: {
        DataSource.DataNameChoices.CONSOMMATION_ESPACE: Cerema._meta.db_table,
    },
}

field_mapping = {
    DataSource.DatasetChoices.OCSGE: {
        DataSource.DataNameChoices.OCCUPATION_DU_SOL: {
            "id_source": "ID",
            "couverture": "CODE_CS",
            "usage": "CODE_US",
            "year": "YEAR",
            "srid_source": "SRID",
            "is_artificial": "IS_ARTIF",
            "departement": "DPT",
            "surface": "SURFACE",
            "mpoly": "GEOMETRY",
        },
        DataSource.DataNameChoices.DIFFERENCE: {
            "year_old": "YEAR_OLD",
            "year_new": "YEAR_NEW",
            "cs_new": "CS_NEW",
            "cs_old": "CS_OLD",
            "us_new": "US_NEW",
            "us_old": "US_OLD",
            "srid_source": "SRID",
            "surface": "SURFACE",
            "is_new_artif": "NEW_ARTIF",
            "is_new_natural": "NEW_NAT",
            "departement": "DPT",
            "mpoly": "GEOMETRY",
        },
        DataSource.DataNameChoices.ZONE_CONSTRUITE: {
            "id_source": "ID",
            "year": "YEAR",
            "millesime": "MILLESIME",
            "srid_source": "SRID",
            "departement": "DPT",
            "surface": "SURFACE",
            "mpoly": "GEOMETRY",
        },
        DataSource.DataNameChoices.ZONE_ARTIFICIELLE: {
            "year": "YEAR",
            "departement": "DPT",
            "surface": "SURFACE",
            "srid_source": "SRID",
            "city": "CITY",
            "mpoly": "GEOMETRY",
        },
    },
    DataSource.DatasetChoices.MAJIC: {
        DataSource.DataNameChoices.CONSOMMATION_ESPACE: {
            "city_insee": "idcom",
            "city_name": "idcomtxt",
            "region_id": "idreg",
            "region_name": "idregtxt",
            "dept_id": "iddep",
            "dept_name": "iddeptxt",
            "epci_id": "epci23",
            "epci_name": "epci23txt",
            "scot": "scot",
            "naf09art10": "naf09art10",
            "art09act10": "art09act10",
            "art09hab10": "art09hab10",
            "art09mix10": "art09mix10",
            "art09rou10": "art09rou10",
            "art09fer10": "art09fer10",
            "art09inc10": "art09inc10",
            "naf10art11": "naf10art11",
            "art10act11": "art10act11",
            "art10hab11": "art10hab11",
            "art10mix11": "art10mix11",
            "art10rou11": "art10rou11",
            "art10fer11": "art10fer11",
            "art10inc11": "art10inc11",
            "naf11art12": "naf11art12",
            "art11act12": "art11act12",
            "art11hab12": "art11hab12",
            "art11mix12": "art11mix12",
            "art11rou12": "art11rou12",
            "art11fer12": "art11fer12",
            "art11inc12": "art11inc12",
            "naf12art13": "naf12art13",
            "art12act13": "art12act13",
            "art12hab13": "art12hab13",
            "art12mix13": "art12mix13",
            "art12rou13": "art12rou13",
            "art12fer13": "art12fer13",
            "art12inc13": "art12inc13",
            "naf13art14": "naf13art14",
            "art13act14": "art13act14",
            "art13hab14": "art13hab14",
            "art13mix14": "art13mix14",
            "art13rou14": "art13rou14",
            "art13fer14": "art13fer14",
            "art13inc14": "art13inc14",
            "naf14art15": "naf14art15",
            "art14act15": "art14act15",
            "art14hab15": "art14hab15",
            "art14mix15": "art14mix15",
            "art14rou15": "art14rou15",
            "art14fer15": "art14fer15",
            "art14inc15": "art14inc15",
            "naf15art16": "naf15art16",
            "art15act16": "art15act16",
            "art15hab16": "art15hab16",
            "art15mix16": "art15mix16",
            "art15rou16": "art15rou16",
            "art15fer16": "art15fer16",
            "art15inc16": "art15inc16",
            "naf16art17": "naf16art17",
            "art16act17": "art16act17",
            "art16hab17": "art16hab17",
            "art16mix17": "art16mix17",
            "art16rou17": "art16rou17",
            "art16fer17": "art16fer17",
            "art16inc17": "art16inc17",
            "naf17art18": "naf17art18",
            "art17act18": "art17act18",
            "art17hab18": "art17hab18",
            "art17mix18": "art17mix18",
            "art17rou18": "art17rou18",
            "art17fer18": "art17fer18",
            "art17inc18": "art17inc18",
            "naf18art19": "naf18art19",
            "art18act19": "art18act19",
            "art18hab19": "art18hab19",
            "art18mix19": "art18mix19",
            "art18rou19": "art18rou19",
            "art18fer19": "art18fer19",
            "art18inc19": "art18inc19",
            "naf19art20": "naf19art20",
            "art19act20": "art19act20",
            "art19hab20": "art19hab20",
            "art19mix20": "art19mix20",
            "art19rou20": "art19rou20",
            "art19fer20": "art19fer20",
            "art19inc20": "art19inc20",
            "naf20art21": "naf20art21",
            "art20act21": "art20act21",
            "art20hab21": "art20hab21",
            "art20mix21": "art20mix21",
            "art20rou21": "art20rou21",
            "art20fer21": "art20fer21",
            "art20inc21": "art20inc21",
            "naf21art22": "naf21art22",
            "art21act22": "art21act22",
            "art21hab22": "art21hab22",
            "art21mix22": "art21mix22",
            "art21rou22": "art21rou22",
            "art21fer22": "art21fer22",
            "art21inc22": "art21inc22",
            "naf22art23": "naf22art23",
            "art22act23": "art22act23",
            "art22hab23": "art22hab23",
            "art22mix23": "art22mix23",
            "art22rou23": "art22rou23",
            "art22fer23": "art22fer23",
            "art22inc23": "art22inc23",
            "naf09art23": "naf09art23",
            "art09act23": "art09act23",
            "art09hab23": "art09hab23",
            "art09mix23": "art09mix23",
            "art09rou23": "art09rou23",
            "art09fer23": "art09fer23",
            "art09inc23": "art09inc23",
            "artcom0923": "artcom0923",
            "aav2020": "aav2020",
            "aav2020txt": "aav2020txt",
            "aav2020_ty": "aav2020_ty",
            "pop14": "pop14",
            "pop20": "pop20",
            "pop1420": "pop1420",
            "men14": "men14",
            "men20": "men20",
            "men1420": "men1420",
            "emp14": "emp14",
            "emp20": "emp20",
            "emp1420": "emp1420",
            "mepart1420": "mepart1420",
            "menhab1420": "menhab1420",
            "artpop1420": "artpop1420",
            "surfcom23": "surfcom202",
            "naf11art21": "NAF11ART21",
            "art11hab21": "ART11HAB21",
            "art11act21": "ART11ACT21",
            "mpoly": "GEOMETRY",
            "srid_source": "SRID",
        },
    },
}


class Command(BaseCommand):
    def add_arguments(self, parser):
        possible_sources = DataSource.objects.filter(productor=DataSource.ProductorChoices.MDA)

        names = [name for dataset in source_to_table_map for name in source_to_table_map[dataset]]
        datasets = source_to_table_map.keys()
        land_ids = set([source.official_land_id for source in possible_sources])

        parser.add_argument("--dataset", type=str, required=True, choices=datasets)
        parser.add_argument("--millesimes", type=int, nargs="*", default=[])
        parser.add_argument("--land_id", type=str, required=True, choices=land_ids)
        parser.add_argument("--name", type=str, choices=names)

    def get_sources_queryset(self, options):
        sources = DataSource.objects.filter(
            dataset=options.get("dataset"),
            official_land_id=options.get("land_id"),
            productor=DataSource.ProductorChoices.MDA,
            millesimes__overlap=options.get("millesimes"),
        )
        if options.get("name"):
            sources = sources.filter(name=options.get("name"))

        return sources

    def load_shapefile_to_db(
        self,
        shapefile_path: Path,
        source: DataSource,
    ):
        db = settings.DATABASES["default"]

        destination_table_name = source_to_table_map[source.dataset][source.name]
        mapping = field_mapping[source.dataset][source.name]

        command = [
            "ogr2ogr",
            "-dialect",
            "SQLITE",
            "-f",
            '"PostgreSQL"',
            f'"PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}"',  # noqa: E501
            str(shapefile_path.absolute()),
            "-s_srs",
            f"EPSG:{source.srid}",
            "-t_srs",
            "EPSG:4326",
            "--config",
            "PG_USE_COPY",
            "YES",
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            destination_table_name,
            "-append",
            "-sql",
            f'"SELECT {", ".join([f"{value} AS {key}" for key, value in mapping.items()])} FROM {source.name}"',
        ]
        subprocess.run(" ".join(command), check=True, shell=True)

    def handle(self, *args, **options) -> None:
        for source in self.get_sources_queryset(options):
            with ShapefileFromSource(source=source) as shapefile_path:
                logger.info("Deleting previously loaded data")
                deleted_count, _ = source.delete_loaded_data()
                logger.info(f"Deleted {deleted_count} previously loaded features")
                logger.info("Loading shapefile to db")
                self.load_shapefile_to_db(
                    shapefile_path=shapefile_path,
                    source=source,
                )
                logger.info("Loaded shapefile to db")
