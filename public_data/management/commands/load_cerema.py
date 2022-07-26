import logging

from django.core.management.base import BaseCommand

from public_data.models.mixins import AutoLoadMixin, TruncateTableMixin
from public_data.models import Cerema


logger = logging.getLogger("management.commands")


class LoadCerema(TruncateTableMixin, AutoLoadMixin, Cerema):
    class Meta:
        proxy = True

    shape_file_path = "obs_artif_conso_com_2009_2021.zip"

    mapping = {
        "city_insee": "idcom",
        "city_name": "idcomtxt",
        "region_id": "idreg",
        "region_name": "idregtxt",
        "dept_id": "iddep",
        "dept_name": "iddeptxt",
        "epci_id": "epci21",
        "epci_name": "epci21txt",
        "scot": "scot",
        "aav2020": "aav2020",
        "libaav2020": "aav2020txt",
        "aav2020_ty": "aav2020_ty",
        "naf09art10": "naf09art10",
        "art09act10": "art09act10",
        "art09hab10": "art09hab10",
        "art09mix10": "art09mix10",
        "art09inc10": "art09inc10",
        "naf10art11": "naf10art11",
        "art10act11": "art10act11",
        "art10hab11": "art10hab11",
        "art10mix11": "art10mix11",
        "art10inc11": "art10inc11",
        "naf11art12": "naf11art12",
        "art11act12": "art11act12",
        "art11hab12": "art11hab12",
        "art11mix12": "art11mix12",
        "art11inc12": "art11inc12",
        "naf12art13": "naf12art13",
        "art12act13": "art12act13",
        "art12hab13": "art12hab13",
        "art12mix13": "art12mix13",
        "art12inc13": "art12inc13",
        "naf13art14": "naf13art14",
        "art13act14": "art13act14",
        "art13hab14": "art13hab14",
        "art13mix14": "art13mix14",
        "art13inc14": "art13inc14",
        "naf14art15": "naf14art15",
        "art14act15": "art14act15",
        "art14hab15": "art14hab15",
        "art14mix15": "art14mix15",
        "art14inc15": "art14inc15",
        "naf15art16": "naf15art16",
        "art15act16": "art15act16",
        "art15hab16": "art15hab16",
        "art15mix16": "art15mix16",
        "art15inc16": "art15inc16",
        "naf16art17": "naf16art17",
        "art16act17": "art16act17",
        "art16hab17": "art16hab17",
        "art16mix17": "art16mix17",
        "art16inc17": "art16inc17",
        "naf17art18": "naf17art18",
        "art17act18": "art17act18",
        "art17hab18": "art17hab18",
        "art17mix18": "art17mix18",
        "art17inc18": "art17inc18",
        "naf18art19": "naf18art19",
        "art18act19": "art18act19",
        "art18hab19": "art18hab19",
        "art18mix19": "art18mix19",
        "art18inc19": "art18inc19",
        "naf19art20": "naf19art20",
        "art19act20": "art19act20",
        "art19hab20": "art19hab20",
        "art19mix20": "art19mix20",
        "art19inc20": "art19inc20",
        "naf20art21": "naf20art21",
        "art20act21": "art20act21",
        "art20hab21": "art20hab21",
        "art20mix21": "art20mix21",
        "art20inc21": "art20inc21",
        "naf09art21": "naf09art21",
        "art09act21": "art09act21",
        "art09hab21": "art09hab21",
        "art09mix21": "art09mix21",
        "art09inc21": "art09inc21",
        "artcom0921": "artcom0921",
        "pop13": "pop13",
        "pop18": "pop18",
        "pop1318": "pop1318",
        "men13": "men13",
        "men18": "men18",
        "men1318": "men1318",
        "emp13": "emp13",
        "emp18": "emp18",
        "emp1318": "emp1318",
        "mepart1318": "mepart1318",
        "menhab1318": "menhab1318",
        "artpop1318": "artpop1318",
        "surfcom202": "surfcom202",
        "mpoly": "MULTIPOLYGON",
    }

    def __str__(self):
        return (
            f"{self.region_name}-{self.dept_name}-{self.city_name}({self.city_insee})"
        )

    @classmethod
    def clean_data(cls, clean_queryset=None):
        # cls.objects.all().delete()
        cls.truncate()


class Command(BaseCommand):
    help = "Load data from Cerema"

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-verbose",
            action="store_true",
            help="reduce output",
        )

    def handle(self, *args, **options):
        logger.info("Load Cerema")
        LoadCerema.load(verbose=not options["no_verbose"], strict=False, silent=False)
        logger.info("End Cerema")
