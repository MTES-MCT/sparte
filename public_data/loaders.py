from typing import Self

from django.contrib.gis.db.models.functions import Area
from django.db.models import DecimalField, F
from django.db.models.functions import Cast

from public_data.models import (
    SRID,
    AutoLoadMixin,
    CouvertureUsageMatrix,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)
from public_data.models.cerema import Cerema
from utils.db import DynamicSRIDTransform


# syntaxic sugar to avoid writing long line of code
# cache has been added to matrix_dict method
def get_matrix(cs, us):
    return CouvertureUsageMatrix().matrix_dict()[(cs, us)]


class AutoOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs) -> Self:
        self.year = self.__class__._year
        self.departement = self.__class__._departement
        self.srid_source = self.srid

        self.matrix = get_matrix(self.couverture, self.usage)
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()

    @classmethod
    def calculate_fields(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).update(
            surface=Cast(
                Area(DynamicSRIDTransform("mpoly", "srid_source")),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class AutoOcsgeDiff(AutoLoadMixin, OcsgeDiff):
    class Meta:
        proxy = True

    @classmethod
    @property
    def mapping(cls) -> dict[str, str]:
        return {
            "cs_old": f"CS_{cls._year_old}",
            "us_old": f"US_{cls._year_old}",
            "cs_new": f"CS_{cls._year_new}",
            "us_new": f"US_{cls._year_new}",
            "mpoly": "MULTIPOLYGON",
        }

    def before_save(self) -> None:
        self.year_new = self.__class__._year_new
        self.year_old = self.__class__._year_old
        self.departement = self.__class__._departement
        self.srid_source = self.srid

        self.new_matrix = get_matrix(self.cs_new, self.us_new)
        self.new_is_artif = bool(self.new_matrix.is_artificial)

        if self.new_matrix.couverture:
            self.cs_new_label = self.new_matrix.couverture.label

        if self.new_matrix.usage:
            self.us_new_label = self.new_matrix.usage.label

        self.old_matrix = get_matrix(self.cs_old, self.us_old)
        self.old_is_artif = bool(self.old_matrix.is_artificial)

        if self.old_matrix.couverture:
            self.cs_old_label = self.old_matrix.couverture.label
        if self.old_matrix.usage:
            self.us_old_label = self.old_matrix.usage.label

        self.is_new_artif = not self.old_is_artif and self.new_is_artif
        self.is_new_natural = self.old_is_artif and not self.new_is_artif

    @classmethod
    def calculate_fields(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).update(
            surface=Cast(
                Area(DynamicSRIDTransform("mpoly", "srid_source")),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).delete()


class AutoZoneConstruite(AutoLoadMixin, ZoneConstruite):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs) -> Self:
        self.year = int(self._year)
        self.departement = self.__class__._departement
        self.srid_source = self.srid
        self.surface = self.mpoly.transform(self.srid, clone=True).area
        self.departement = self._departement
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()


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
