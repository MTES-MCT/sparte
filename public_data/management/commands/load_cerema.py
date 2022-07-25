import logging

from django.core.management.base import BaseCommand

from public_data.models.mixins import AutoLoadMixin
from public_data.models import Cerema


logger = logging.getLogger("management.commands")


class LoadCerema(AutoLoadMixin, Cerema):
    class Meta:
        proxy = True

    shape_file_path = "ref_plan.zip"

    mapping = {
        "city_insee": "IDCOM",
        "city_name": "IDCOMTXT",
        "region_id": "IDREG",
        "region_name": "IDREGTXT",
        "dept_id": "IDDEP",
        "dept_name": "IDDEPTXT",
        "epci_id": "EPCI20",
        "epci_name": "EPCI20TXT",
        "aav2020": "AAV2020",
        "libaav2020": "LIBAAV2020",
        "cateaav202": "CATEAAV202",
        "naf09art10": "NAF09ART10",  # 2010
        "art09act10": "ART09ACT10",
        "art09hab10": "ART09HAB10",
        "art09mix10": "ART09MIX10",
        "art09inc10": "ART09INC10",
        "naf10art11": "NAF10ART11",  # 2011
        "art10act11": "ART10ACT11",
        "art10hab11": "ART10HAB11",
        "art10mix11": "ART10MIX11",
        "art10inc11": "ART10INC11",
        "naf11art12": "NAF11ART12",  # 2012
        "art11act12": "ART11ACT12",
        "art11hab12": "ART11HAB12",
        "art11mix12": "ART11MIX12",
        "art11inc12": "ART11INC12",
        "naf12art13": "NAF12ART13",
        "art12act13": "ART12ACT13",
        "art12hab13": "ART12HAB13",
        "art12mix13": "ART12MIX13",
        "art12inc13": "ART12INC13",
        "naf13art14": "NAF13ART14",
        "art13act14": "ART13ACT14",
        "art13hab14": "ART13HAB14",
        "art13mix14": "ART13MIX14",
        "art13inc14": "ART13INC14",
        "naf14art15": "NAF14ART15",
        "art14act15": "ART14ACT15",
        "art14hab15": "ART14HAB15",
        "art14mix15": "ART14MIX15",
        "art14inc15": "ART14INC15",
        "naf15art16": "NAF15ART16",
        "art15act16": "ART15ACT16",
        "art15hab16": "ART15HAB16",
        "art15mix16": "ART15MIX16",
        "art15inc16": "ART15INC16",
        "naf16art17": "NAF16ART17",
        "art16act17": "ART16ACT17",
        "art16hab17": "ART16HAB17",
        "art16mix17": "ART16MIX17",
        "art16inc17": "ART16INC17",
        "naf17art18": "NAF17ART18",
        "art17act18": "ART17ACT18",
        "art17hab18": "ART17HAB18",
        "art17mix18": "ART17MIX18",
        "art17inc18": "ART17INC18",
        "naf18art19": "NAF18ART19",
        "art18act19": "ART18ACT19",
        "art18hab19": "ART18HAB19",
        "art18mix19": "ART18MIX19",
        "art18inc19": "ART18INC19",
        "naf19art20": "NAF19ART20",  # 2020
        "art19act20": "ART19ACT20",
        "art19hab20": "ART19HAB20",
        "art19mix20": "ART19MIX20",
        "art19inc20": "ART19INC20",
        "nafart0920": "NAFART0920",
        "artact0920": "ARTACT0920",
        "arthab0920": "ARTHAB0920",
        "artmix0920": "ARTMIX0920",
        "artinc0920": "ARTINC0920",
        "artcom0920": "ARTCOM0920",
        "pop12": "POP12",
        "pop17": "POP17",
        "pop1217": "POP1217",
        "men12": "MEN12",
        "men17": "MEN17",
        "men1217": "MEN1217",
        "emp17": "EMP17",
        "emp12": "EMP12",
        "emp1217": "EMP1217",
        "mepart1217": "MEPART1217",
        "menhab1217": "MENHAB1217",
        "artpop1217": "ARTPOP1217",
        "surfcom20": "SURFCOM20",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls, clean_queryset=None):
        cls.objects.all().delete()


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
        LoadCerema.load(verbose=not options["no_verbose"])
        logger.info("End Cerema")
