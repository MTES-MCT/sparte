from django.test import TestCase

from public_data.models import Cerema, Commune, Departement, Region

from .containers import PublicDataContainer

# cerema fields
"""
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

    # Millésime 2023
    naf22art23 = models.FloatField(null=True)
    art22act23 = models.FloatField(null=True)
    art22hab23 = models.FloatField(null=True)
    art22mix23 = models.FloatField(null=True)
    art22rou23 = models.FloatField(null=True)
    art22fer23 = models.FloatField(null=True)
    art22inc23 = models.FloatField(null=True)

    # Data stored without current usage
    naf09art23 = models.FloatField(null=True)
    art09act23 = models.FloatField(null=True)
    art09hab23 = models.FloatField(null=True)
    art09mix23 = models.FloatField(null=True)
    art09rou23 = models.FloatField(null=True)
    art09fer23 = models.FloatField(null=True)
    art09inc23 = models.FloatField(null=True)

    artcom0923 = models.FloatField(null=True)

    aav2020 = models.CharField(max_length=80, null=True)
    aav2020txt = models.CharField(max_length=1, null=True)
    aav2020_ty = models.CharField(max_length=6, null=True)

    pop14 = models.BigIntegerField(null=True)
    pop20 = models.BigIntegerField(null=True)
    pop1420 = models.BigIntegerField(null=True)
    men14 = models.BigIntegerField(null=True)
    men20 = models.BigIntegerField(null=True)
    men1420 = models.BigIntegerField(null=True)
    emp14 = models.BigIntegerField(null=True)
    emp20 = models.BigIntegerField(null=True)
    emp1420 = models.BigIntegerField(null=True)

    mepart1420 = models.FloatField(null=True)
    menhab1420 = models.FloatField(null=True)
    artpop1420 = models.FloatField(null=True)

    surfcom23 = models.FloatField(null=True)
    artcom2020 = models.FloatField(null=True)

    # calculated field :
    naf11art21 = models.FloatField(null=True)
    art11hab21 = models.FloatField(null=True)
    art11act21 = models.FloatField(null=True)


"""


class PublicDataContainerTest(TestCase):
    def setUp(self) -> None:
        empty_geom = "MULTIPOLYGON EMPTY"
        self.region = Region.objects.create(
            name="region",
            mpoly=empty_geom,
            source_id="000",
        )
        self.departement = Departement.objects.create(
            name="departement",
            region=self.region,
            mpoly=empty_geom,
            source_id="000",
        )

        self.commune_1 = Commune.objects.create(
            insee="000",
            name="commune",
            departement=self.departement,
            mpoly=empty_geom,
        )
        Cerema.objects.create(
            city_insee=self.commune_1.insee,
            city_name=self.commune_1.name,
            region_id=self.region.source_id,
            region_name=self.region.name,
            dept_id=self.departement.source_id,
            dept_name=self.departement.name,
            epci_id="000",
            epci_name="epci_name",
            scot="scot",
            naf09art10=1,
            art09act10=2,
            art09hab10=3,
            art09mix10=4,
            art09rou10=5,
            art09fer10=6,
            art09inc10=7,
            naf10art11=8,
            art10act11=9,
            art10hab11=10,
            art10mix11=11,
            art10rou11=12,
            art10fer11=13,
            art10inc11=14,
            naf11art12=15,
            art11act12=16,
            art11hab12=17,
            art11mix12=18,
            art11rou12=19,
            art11fer12=20,
            art11inc12=21,
            naf12art13=22,
            art12act13=23,
            art12hab13=24,
            art12mix13=25,
            art12rou13=26,
            art12fer13=27,
            art12inc13=28,
            naf13art14=29,
            art13act14=30,
            art13hab14=31,
            art13mix14=32,
            art13rou14=33,
            art13fer14=34,
            art13inc14=35,
            naf14art15=36,
            art14act15=37,
            art14hab15=38,
            art14mix15=39,
            art14rou15=40,
            art14fer15=41,
            art14inc15=42,
            naf15art16=43,
            art15act16=44,
            art15hab16=45,
            art15mix16=46,
            art15rou16=47,
            art15fer16=48,
            art15inc16=49,
            naf16art17=50,
            art16act17=51,
            art16hab17=52,
            art16mix17=53,
            art16rou17=54,
            art16fer17=55,
            art16inc17=56,
            naf17art18=57,
            art17act18=58,
            art17hab18=59,
            art17mix18=60,
            art17rou18=61,
            art17fer18=62,
            art17inc18=63,
            naf18art19=64,
            art18act19=65,
            art18hab19=66,
            art18mix19=67,
            art18rou19=68,
            art18fer19=69,
            art18inc19=70,
            naf19art20=71,
            art19act20=72,
            art19hab20=73,
            art19mix20=74,
            art19rou20=75,
            art19fer20=76,
            art19inc20=77,
            naf20art21=78,
            art20act21=79,
            art20hab21=80,
            art20mix21=81,
            art20rou21=82,
            art20fer21=83,
            art20inc21=84,
            naf21art22=85,
            art21act22=86,
            art21hab22=87,
            art21mix22=88,
            art21rou22=89,
            art21fer22=90,
            art21inc22=91,
            naf22art23=92,
            art22act23=93,
            art22hab23=94,
            art22mix23=95,
            art22rou23=96,
            art22fer23=97,
            art22inc23=98,
            naf09art23=99,
            art09act23=100,
            art09hab23=101,
            art09mix23=102,
            art09rou23=103,
            art09fer23=104,
            art09inc23=105,
            artcom0923=106,
            aav2020="aav2020",
            aav2020txt="aav2020txt",
            aav2020_ty="aav2020_ty",
            pop14=107,
            pop20=108,
            pop1420=109,
            men14=110,
            men20=111,
            men1420=112,
            emp14=113,
            emp20=114,
            emp1420=115,
            mepart1420=116,
            menhab1420=117,
            artpop1420=118,
            surfcom23=119,
            artcom2020=120,
            naf11art21=121,
            art11hab21=122,
            art11act21=123,
            mpoly=empty_geom,
            srid_source=2154,
        )

    def test_conso_progression_service_returns_empty_list_with_empty_queryset_of_communes(self):
        conso_service = PublicDataContainer.consommation_progression_service()

        self.assertListEqual(
            conso_service.get_by_communes(
                communes=Commune.objects.none(),
                start_date=2010,
                end_date=2020,
            ),
            [],
        )
