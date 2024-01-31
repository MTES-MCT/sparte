"""
Contient le modèle de donnée du Cerema qui décrit les changements cadastraux agrégé au
niveau de la commune. Utilisé pour :
* Construire les régions administratives (région, commune...) via la commande "load_from_cerema"
* Le rapport consommation d'un diagnostic

Remarque importante, le fichier travail par année. Une année commence le 1er janvier de
l'année précédente (N-1) au 1er janvier de l'année souhaitée (par exemple l'année 2013
cours depuis le 01.01.2012 jusqu'au 01.01.2013). Ainsi, la surface consommé en 2013 est
dans la colonne "naf12art13".

Données récupérées le 16/12/2021
https://cerema.app.box.com/v/pnb-action7-indicateurs-ff/folder/149684581362
La description précise des données est disponible dans un PDF dans lien ci-dessus
"""
from django.contrib.gis.db import models
from django.db.models import F

from public_data.models.enums import SRID
from public_data.models.mixins import AutoLoadMixin, DataColorationMixin


class CeremaManager(models.Manager):
    def pre_annotated(self):
        qs = self.all()
        annotations = {str(y): F(f"naf{y:0>2}art{y+1:0>2}") for y in range(9, 21)}
        qs = qs.annotate(**annotations)
        return qs


class Cerema(DataColorationMixin, models.Model):
    city_insee = models.CharField(max_length=7, db_index=True)
    city_name = models.CharField(max_length=50, db_index=True)
    region_id = models.CharField(max_length=50, db_index=True)
    region_name = models.CharField(max_length=50, db_index=True)
    dept_id = models.CharField(max_length=50, db_index=True)
    dept_name = models.CharField(max_length=50, db_index=True)
    epci_id = models.CharField(max_length=50, db_index=True)
    epci_name = models.CharField(max_length=70, db_index=True)
    scot = models.CharField(max_length=254, null=True)
    naf09art10 = models.FloatField(null=True)
    art09act10 = models.FloatField(null=True)
    art09hab10 = models.FloatField(null=True)
    art09mix10 = models.FloatField(null=True)
    art09rou10 = models.FloatField(null=True)
    art09fer10 = models.FloatField(null=True)
    art09inc10 = models.FloatField(null=True)
    naf10art11 = models.FloatField(null=True)
    art10act11 = models.FloatField(null=True)
    art10hab11 = models.FloatField(null=True)
    art10mix11 = models.FloatField(null=True)
    art10rou11 = models.FloatField(null=True)
    art10fer11 = models.FloatField(null=True)
    art10inc11 = models.FloatField(null=True)
    naf11art12 = models.FloatField(null=True)
    art11act12 = models.FloatField(null=True)
    art11hab12 = models.FloatField(null=True)
    art11mix12 = models.FloatField(null=True)
    art11rou12 = models.FloatField(null=True)
    art11fer12 = models.FloatField(null=True)
    art11inc12 = models.FloatField(null=True)
    naf12art13 = models.FloatField(null=True)
    art12act13 = models.FloatField(null=True)
    art12hab13 = models.FloatField(null=True)
    art12mix13 = models.FloatField(null=True)
    art12rou13 = models.FloatField(null=True)
    art12fer13 = models.FloatField(null=True)
    art12inc13 = models.FloatField(null=True)
    naf13art14 = models.FloatField(null=True)
    art13act14 = models.FloatField(null=True)
    art13hab14 = models.FloatField(null=True)
    art13mix14 = models.FloatField(null=True)
    art13rou14 = models.FloatField(null=True)
    art13fer14 = models.FloatField(null=True)
    art13inc14 = models.FloatField(null=True)
    naf14art15 = models.FloatField(null=True)
    art14act15 = models.FloatField(null=True)
    art14hab15 = models.FloatField(null=True)
    art14mix15 = models.FloatField(null=True)
    art14rou15 = models.FloatField(null=True)
    art14fer15 = models.FloatField(null=True)
    art14inc15 = models.FloatField(null=True)
    naf15art16 = models.FloatField(null=True)
    art15act16 = models.FloatField(null=True)
    art15hab16 = models.FloatField(null=True)
    art15mix16 = models.FloatField(null=True)
    art15rou16 = models.FloatField(null=True)
    art15fer16 = models.FloatField(null=True)
    art15inc16 = models.FloatField(null=True)
    naf16art17 = models.FloatField(null=True)
    art16act17 = models.FloatField(null=True)
    art16hab17 = models.FloatField(null=True)
    art16mix17 = models.FloatField(null=True)
    art16rou17 = models.FloatField(null=True)
    art16fer17 = models.FloatField(null=True)
    art16inc17 = models.FloatField(null=True)
    naf17art18 = models.FloatField(null=True)
    art17act18 = models.FloatField(null=True)
    art17hab18 = models.FloatField(null=True)
    art17mix18 = models.FloatField(null=True)
    art17rou18 = models.FloatField(null=True)
    art17fer18 = models.FloatField(null=True)
    art17inc18 = models.FloatField(null=True)
    naf18art19 = models.FloatField(null=True)
    art18act19 = models.FloatField(null=True)
    art18hab19 = models.FloatField(null=True)
    art18mix19 = models.FloatField(null=True)
    art18rou19 = models.FloatField(null=True)
    art18fer19 = models.FloatField(null=True)
    art18inc19 = models.FloatField(null=True)
    naf19art20 = models.FloatField(null=True)
    art19act20 = models.FloatField(null=True)
    art19hab20 = models.FloatField(null=True)
    art19mix20 = models.FloatField(null=True)
    art19rou20 = models.FloatField(null=True)
    art19fer20 = models.FloatField(null=True)
    art19inc20 = models.FloatField(null=True)
    naf20art21 = models.FloatField(null=True)
    art20act21 = models.FloatField(null=True)
    art20hab21 = models.FloatField(null=True)
    art20mix21 = models.FloatField(null=True)
    art20rou21 = models.FloatField(null=True)
    art20fer21 = models.FloatField(null=True)
    art20inc21 = models.FloatField(null=True)
    naf21art22 = models.FloatField(null=True)
    art21act22 = models.FloatField(null=True)
    art21hab22 = models.FloatField(null=True)
    art21mix22 = models.FloatField(null=True)
    art21rou22 = models.FloatField(null=True)
    art21fer22 = models.FloatField(null=True)
    art21inc22 = models.FloatField(null=True)

    # Data stored without current usage
    naf09art22 = models.FloatField(null=True)
    art09act22 = models.FloatField(null=True)
    art09hab22 = models.FloatField(null=True)
    art09mix22 = models.FloatField(null=True)
    art09rou22 = models.FloatField(null=True)
    art09fer22 = models.FloatField(null=True)
    art09inc22 = models.FloatField(null=True)
    artcom0922 = models.FloatField(null=True)
    aav2020 = models.CharField(max_length=80, null=True)
    libaav2020 = models.CharField(max_length=80, null=True)
    aav2020txt = models.CharField(max_length=1, null=True)
    aav2020_ty = models.CharField(max_length=6, null=True)
    pop13 = models.BigIntegerField(null=True)
    pop19 = models.BigIntegerField(null=True)
    pop1319 = models.BigIntegerField(null=True)
    men13 = models.BigIntegerField(null=True)
    men19 = models.BigIntegerField(null=True)
    men1319 = models.BigIntegerField(null=True)
    emp13 = models.BigIntegerField(null=True)
    emp19 = models.BigIntegerField(null=True)
    emp1319 = models.BigIntegerField(null=True)
    mepart1319 = models.FloatField(null=True)
    menhab1319 = models.FloatField(null=True)
    artpop1319 = models.FloatField(null=True)
    surfcom2022 = models.FloatField(null=True)
    artcom2020 = models.FloatField(null=True)

    # calculated field :
    naf11art21 = models.FloatField(null=True)
    art11hab21 = models.FloatField(null=True)
    art11act21 = models.FloatField(null=True)

    mpoly = models.MultiPolygonField(srid=4326, spatial_index=True)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    objects = CeremaManager()

    default_property = "naf_arti"
    default_color = "pink"

    class Meta:
        indexes = [
            models.Index(fields=["scot"]),
            models.Index(fields=["region_id"]),
            models.Index(fields=["dept_id"]),
            models.Index(fields=["epci_id"]),
        ]

    def __str__(self):
        return self.city_insee

    @classmethod
    def get_art_field(self, start="2010", end="2020"):
        """Return field name list of nafAAartAA (where AA are years) between
        2 years included.

        ..Examples:
        ```
        >>> Cerema.get_art_field(2015, 2018)
        ['naf15art16', 'naf16art17', 'naf17art18', 'naf18art19']
        >>> Cerema.get_art_field(2014, 2014)
        ['naf14art15']
        >>> Cerema.get_art_field(2008, 2030)
        Exception: ValueError
        ```
        """
        end = int(end) - 2000
        start = int(start) - 2000
        if not 9 <= start <= 21:
            raise ValueError("'start' must be between 2009 and 2022")
        if not 10 <= end <= 21:
            raise ValueError("'end' must be between 2010 and 2022")
        if end < start:
            raise ValueError("start must be <= to end")
        return [f"naf{i:0>2}art{i+1:0>2}" for i in range(start, end + 1)]

    @classmethod
    def list_attr(cls):
        """Return all field names with a artif numerical values
        Usefull to get an easy way to change available data withou changing the
        code
        From : naf09art10 (year 2009) to naf19art20 (year 2020)
        """
        return [f"naf{y:0>2}art{y+1:0>2}" for y in range(9, 21 + 1)]


class BaseLoadCerema(AutoLoadMixin, Cerema):
    class Meta:
        proxy = True

    mapping = {
        "city_insee": "IDCOM",
        "city_name": "IDCOMTXT",
        "region_id": "IDREG",
        "region_name": "IDREGTXT",
        "dept_id": "IDDEP",
        "dept_name": "IDDEPTXT",
        "epci_id": "EPCI22",
        "epci_name": "EPCI22TXT",
        "scot": "SCOT",
        "naf09art10": "NAF09ART10",
        "art09act10": "ART09ACT10",
        "art09hab10": "ART09HAB10",
        "art09mix10": "ART09MIX10",
        "art09rou10": "ART09ROU10",
        "art09fer10": "ART09FER10",
        "art09inc10": "ART09INC10",
        "naf10art11": "NAF10ART11",
        "art10act11": "ART10ACT11",
        "art10hab11": "ART10HAB11",
        "art10mix11": "ART10MIX11",
        "art10rou11": "ART10ROU11",
        "art10fer11": "ART10FER11",
        "art10inc11": "ART10INC11",
        "naf11art12": "NAF11ART12",
        "art11act12": "ART11ACT12",
        "art11hab12": "ART11HAB12",
        "art11mix12": "ART11MIX12",
        "art11rou12": "ART11ROU12",
        "art11fer12": "ART11FER12",
        "art11inc12": "ART11INC12",
        "naf12art13": "NAF12ART13",
        "art12act13": "ART12ACT13",
        "art12hab13": "ART12HAB13",
        "art12mix13": "ART12MIX13",
        "art12rou13": "ART12ROU13",
        "art12fer13": "ART12FER13",
        "art12inc13": "ART12INC13",
        "naf13art14": "NAF13ART14",
        "art13act14": "ART13ACT14",
        "art13hab14": "ART13HAB14",
        "art13mix14": "ART13MIX14",
        "art13rou14": "ART13ROU14",
        "art13fer14": "ART13FER14",
        "art13inc14": "ART13INC14",
        "naf14art15": "NAF14ART15",
        "art14act15": "ART14ACT15",
        "art14hab15": "ART14HAB15",
        "art14mix15": "ART14MIX15",
        "art14rou15": "ART14ROU15",
        "art14fer15": "ART14FER15",
        "art14inc15": "ART14INC15",
        "naf15art16": "NAF15ART16",
        "art15act16": "ART15ACT16",
        "art15hab16": "ART15HAB16",
        "art15mix16": "ART15MIX16",
        "art15rou16": "ART15ROU16",
        "art15fer16": "ART15FER16",
        "art15inc16": "ART15INC16",
        "naf16art17": "NAF16ART17",
        "art16act17": "ART16ACT17",
        "art16hab17": "ART16HAB17",
        "art16mix17": "ART16MIX17",
        "art16rou17": "ART16ROU17",
        "art16fer17": "ART16FER17",
        "art16inc17": "ART16INC17",
        "naf17art18": "NAF17ART18",
        "art17act18": "ART17ACT18",
        "art17hab18": "ART17HAB18",
        "art17mix18": "ART17MIX18",
        "art17rou18": "ART17ROU18",
        "art17fer18": "ART17FER18",
        "art17inc18": "ART17INC18",
        "naf18art19": "NAF18ART19",
        "art18act19": "ART18ACT19",
        "art18hab19": "ART18HAB19",
        "art18mix19": "ART18MIX19",
        "art18rou19": "ART18ROU19",
        "art18fer19": "ART18FER19",
        "art18inc19": "ART18INC19",
        "naf19art20": "NAF19ART20",
        "art19act20": "ART19ACT20",
        "art19hab20": "ART19HAB20",
        "art19mix20": "ART19MIX20",
        "art19rou20": "ART19ROU20",
        "art19fer20": "ART19FER20",
        "art19inc20": "ART19INC20",
        "naf20art21": "NAF20ART21",
        "art20act21": "ART20ACT21",
        "art20hab21": "ART20HAB21",
        "art20mix21": "ART20MIX21",
        "art20rou21": "ART20ROU21",
        "art20fer21": "ART20FER21",
        "art20inc21": "ART20INC21",
        "naf21art22": "NAF21ART22",
        "art21act22": "ART21ACT22",
        "art21hab22": "ART21HAB22",
        "art21mix22": "ART21MIX22",
        "art21rou22": "ART21ROU22",
        "art21fer22": "ART21FER22",
        "art21inc22": "ART21INC22",
        "mpoly": "MULTIPOLYGON",
        # mis dans la table tel quel (pas d'usage à date)
        "naf09art22": "NAF09ART22",
        "art09act22": "ART09ACT22",
        "art09hab22": "ART09HAB22",
        "art09mix22": "ART09MIX22",
        "art09inc22": "ART09INC22",
        "art09rou22": "ART09ROU22",
        "art09fer22": "ART09FER22",
        "artcom2020": "ARTCOM2020",
        "pop13": "POP13",
        "pop19": "POP19",
        "pop1319": "POP1319",
        "men13": "MEN13",
        "men19": "MEN19",
        "men1319": "MEN1319",
        "emp13": "EMP13",
        "emp19": "EMP19",
        "emp1319": "EMP1319",
        "mepart1319": "MEPART1319",
        "menhab1319": "MENHAB1319",
        "artpop1319": "ARTPOP1319",
        "surfcom2022": "SURFCOM202",
        "aav2020": "AAV2020",
        "aav2020txt": "AAV2020TXT",
        "aav2020_ty": "AAV2020_TY",
    }

    def __str__(self):
        return f"{self.region_name}-{self.dept_name}-{self.city_name}({self.city_insee})"

    @classmethod
    def calculate_fields(cls):
        """Calculate fields to speedup user consultation."""
        fields = cls.get_art_field(2011, 2020)
        kwargs = {
            "naf11art21": sum([F(f) for f in fields]),
            "art11hab21": sum([F(f.replace("art", "hab").replace("naf", "art")) for f in fields]),
            "art11act21": sum([F(f.replace("art", "act").replace("naf", "art")) for f in fields]),
        }
        cls.objects.update(**kwargs)

    @classmethod
    def clean_data(cls):
        cls.objects.filter(srid_source=SRID.LAMBERT_93).delete()


class BaseLoadCeremaDromCom(BaseLoadCerema):
    """
    Base class for DROM COM
    NOTE: we exclude surfcom2022 and artcom2020 because they are not available for DROM COM
    """

    class Meta:
        proxy = True

    mapping = {k: v for k, v in BaseLoadCerema.mapping.items() if k not in ["surfcom2022", "artcom2020"]}

    @classmethod
    def clean_data(cls) -> None:
        return cls.objects.filter(dept_id=cls.departement_id).delete()
