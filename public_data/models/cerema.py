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

from .mixins import DataColorationMixin


class Cerema(DataColorationMixin, models.Model):
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

    default_property = "naf_arti"
    default_color = "pink"

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
