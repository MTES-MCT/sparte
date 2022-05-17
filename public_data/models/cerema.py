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

from .mixins import AutoLoadMixin, DataColorationMixin


class Cerema(AutoLoadMixin, DataColorationMixin, models.Model):
    city_insee = models.CharField(max_length=5, db_index=True)
    city_name = models.CharField(max_length=45)
    region_id = models.CharField(max_length=2)
    region_name = models.CharField(max_length=27)
    dept_id = models.CharField(max_length=3)
    dept_name = models.CharField(max_length=23)
    epci_id = models.CharField(max_length=9)
    epci_name = models.CharField(max_length=64)
    aav2020 = models.CharField(max_length=3, null=True)
    libaav2020 = models.CharField(max_length=39, null=True)
    cateaav202 = models.BigIntegerField(null=True)
    naf09art10 = models.FloatField(null=True)
    art09act10 = models.FloatField(null=True)
    art09hab10 = models.FloatField(null=True)
    art09mix10 = models.FloatField(null=True)
    art09inc10 = models.FloatField(null=True)
    naf10art11 = models.FloatField(null=True)
    art10act11 = models.FloatField(null=True)
    art10hab11 = models.FloatField(null=True)
    art10mix11 = models.FloatField(null=True)
    art10inc11 = models.FloatField(null=True)
    naf11art12 = models.FloatField(null=True)
    art11act12 = models.FloatField(null=True)
    art11hab12 = models.FloatField(null=True)
    art11mix12 = models.FloatField(null=True)
    art11inc12 = models.FloatField(null=True)
    naf12art13 = models.FloatField(null=True)
    art12act13 = models.FloatField(null=True)
    art12hab13 = models.FloatField(null=True)
    art12mix13 = models.FloatField(null=True)
    art12inc13 = models.FloatField(null=True)
    naf13art14 = models.FloatField(null=True)
    art13act14 = models.FloatField(null=True)
    art13hab14 = models.FloatField(null=True)
    art13mix14 = models.FloatField(null=True)
    art13inc14 = models.FloatField(null=True)
    naf14art15 = models.FloatField(null=True)
    art14act15 = models.FloatField(null=True)
    art14hab15 = models.FloatField(null=True)
    art14mix15 = models.FloatField(null=True)
    art14inc15 = models.FloatField(null=True)
    naf15art16 = models.FloatField(null=True)
    art15act16 = models.FloatField(null=True)
    art15hab16 = models.FloatField(null=True)
    art15mix16 = models.FloatField(null=True)
    art15inc16 = models.FloatField(null=True)
    naf16art17 = models.FloatField(null=True)
    art16act17 = models.FloatField(null=True)
    art16hab17 = models.FloatField(null=True)
    art16mix17 = models.FloatField(null=True)
    art16inc17 = models.FloatField(null=True)
    naf17art18 = models.FloatField(null=True)
    art17act18 = models.FloatField(null=True)
    art17hab18 = models.FloatField(null=True)
    art17mix18 = models.FloatField(null=True)
    art17inc18 = models.FloatField(null=True)
    naf18art19 = models.FloatField(null=True)
    art18act19 = models.FloatField(null=True)
    art18hab19 = models.FloatField(null=True)
    art18mix19 = models.FloatField(null=True)
    art18inc19 = models.FloatField(null=True)
    naf19art20 = models.FloatField(null=True)
    art19act20 = models.FloatField(null=True)
    art19hab20 = models.FloatField(null=True)
    art19mix20 = models.FloatField(null=True)
    art19inc20 = models.FloatField(null=True)
    nafart0920 = models.FloatField(null=True)
    artact0920 = models.FloatField(null=True)
    arthab0920 = models.FloatField(null=True)
    artmix0920 = models.FloatField(null=True)
    artinc0920 = models.FloatField(null=True)
    artcom0920 = models.FloatField(null=True)
    pop12 = models.BigIntegerField(null=True)
    pop17 = models.BigIntegerField(null=True)
    pop1217 = models.BigIntegerField(null=True)
    men12 = models.BigIntegerField(null=True)
    men17 = models.BigIntegerField(null=True)
    men1217 = models.BigIntegerField(null=True)
    emp17 = models.BigIntegerField(null=True)
    emp12 = models.BigIntegerField(null=True)
    emp1217 = models.BigIntegerField(null=True)
    mepart1217 = models.FloatField(null=True)
    menhab1217 = models.FloatField(null=True)
    artpop1217 = models.FloatField(null=True)
    surfcom20 = models.FloatField(null=True)
    # calculated field :
    naf11art21 = models.FloatField(null=True)
    art11hab21 = models.FloatField(null=True)
    art11act21 = models.FloatField(null=True)

    mpoly = models.MultiPolygonField()

    shape_file_path = "ref_plan.zip"
    default_property = "naf_arti"
    default_color = "pink"

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

    def __str__(self):
        return self.city_insee

    @classmethod
    def calculate_fields(cls):
        """
        Calculate fields to speedup user consultation
        ..warning:: 2021 is missing in the sum because data are missing.
        ..TODO:: update data to get 2021 and change sum.
        """
        fields = cls.get_art_field(2011, 2019)
        kwargs = {
            "naf11art21": sum([F(f) for f in fields]),
            "art11hab21": sum(
                [F(f.replace("art", "hab").replace("naf", "art")) for f in fields]
            ),
            "art11act21": sum(
                [F(f.replace("art", "act").replace("naf", "art")) for f in fields]
            ),
        }
        cls.objects.update(**kwargs)

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
        >>> Cerema.get_art_field(2008, 2021)
        Exception: ValueError
        ```
        """
        end = int(end) - 2000
        start = int(start) - 2000
        if not 9 <= start <= 20:
            raise ValueError("'start' must be between 2010 and 2020")
        if not 9 <= end <= 20:
            raise ValueError("'end' must be between 2010 and 2020")
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
        return [f"naf{y:0>2}art{y+1:0>2}" for y in range(9, 19 + 1)]
