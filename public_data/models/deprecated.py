"""Ce fichier contient tous les modèles dit "DEPRECATED". Ce sont des modèles qu'il
faut migrer vers les nouvelles façons de stocker les données. Cela nécessite souvent
beaucoup de travail (les views sont également à changer, voir le front) et cela a été
remis à plus tard (dette technique).

Il est également probable que certains modèles ont été total décommissioné mais pas
encore retiré de ce fichier.
"""
from decimal import Decimal

from django.contrib.gis.db import models
from django.db.models import Sum, F

from .cerema import Cerema
from .couverture_usage import CouvertureSol, UsageSol
from .mixins import AutoLoadMixin, DataColorationMixin
from .ocsge import Ocsge


class RefPlan(Cerema):
    """
    Utilisé avant la récupération du fichier du Cerema
    !!! DEPRECATED !!!
    Available for compatibility
    """

    class Meta:
        proxy = True


# DEPRECATED v1.3.0
# Ne concerne que la zone d'arachon, données de test au début du projet
# doit être déplacé vers une commande "load_arcachon" pour être cohérent avec le Gers
# par Swann le 2022.04.27


class Ocsge2015(Ocsge):
    """
    Données de l'OCSGE pour l'année 2015
    Données fournies par Philippe 09/2021
    python manage.py load_data --class public_data.models.Ocsge2015
    """

    shape_file_path = "OCSGE_2015.zip"
    default_color = "Chocolate"
    year = 2015

    @classmethod
    def clean_data(cls):
        """Delete only data with year=2015"""
        cls.objects.filter(year=cls.year).delete()

    def save(self, *args, **kwargs):
        self.year = self.__class__.year
        return super().save(*args, **kwargs)

    class Meta:
        proxy = True


class Ocsge2018(Ocsge2015):
    """
    Données de l'OCSGE pour l'année 2018
    Données fournies par Philippe 09/2021
    Les données sont stockés zippés dans s3://{bucket_name}/data
    Pour les charger dans la base, exécuter la commande suivante:
    python manage.py load_data --class public_data.models.Ocsge2018
    """

    shape_file_path = "OCSGE_2018.zip"
    default_color = "DarkSeaGreen"
    year = 2018

    class Meta:
        proxy = True


# DEPRECATED v1.3.0
# Le format des données à été revue, voir OCSGE, OCSGEDIFF, etc.
# par Swann le 2022.04.27


class ArtifCommune(models.Model):
    name = models.CharField("Nom", max_length=250)
    insee = models.CharField("Code INSEE", max_length=10)
    surface = models.DecimalField("surface (ha)", max_digits=8, decimal_places=2)
    artif_before_2009 = models.DecimalField(
        "Artificial before 2009 (ha)", max_digits=8, decimal_places=2
    )
    artif_2009 = models.DecimalField(
        "New artificial 2009 (ha)", max_digits=8, decimal_places=2
    )
    artif_2010 = models.DecimalField(
        "New artificial 2010 (ha)", max_digits=8, decimal_places=2
    )
    artif_2011 = models.DecimalField(
        "New artificial 2011 (ha)", max_digits=8, decimal_places=2
    )
    artif_2012 = models.DecimalField(
        "New artificial 2012 (ha)", max_digits=8, decimal_places=2
    )
    artif_2013 = models.DecimalField(
        "New artificial 2013 (ha)", max_digits=8, decimal_places=2
    )
    artif_2014 = models.DecimalField(
        "New artificial 2014 (ha)", max_digits=8, decimal_places=2
    )
    artif_2015 = models.DecimalField(
        "New artificial 2015 (ha)", max_digits=8, decimal_places=2
    )
    artif_2016 = models.DecimalField(
        "New artificial 2016 (ha)", max_digits=8, decimal_places=2
    )
    artif_2017 = models.DecimalField(
        "New artificial 2017 (ha)", max_digits=8, decimal_places=2
    )
    artif_2018 = models.DecimalField(
        "New artificial 2018 (ha)", max_digits=8, decimal_places=2
    )

    @classmethod
    def list_attr(cls):
        """Return all field names with a artif numerical values
        Usefull to get an easy way to change available data withou changing the
        code"""
        return ["artif_before_2009"] + [f"artif_{y}" for y in range(2009, 2020)]

    def list_artif(self, flat=True):
        """Return a list of all artif numerical values : `[123.45, 456.78,]`
        if flat is set to False (default is True), return a dict:
        ```
        {
            "artif_2013": 123.45,
            "artif_2014": 456.78,
        }
        ```
        """
        val = {f: getattr(self, f, 0.0) for f in self.__class__.list_attr()}
        if flat:
            return val.values()
        return val

    def total_artif(self):
        """Return the sum of all artif fields"""
        return sum(self.list_artif())

    def total_percent(self) -> Decimal:
        """Return the percent of the surface that is artificial"""
        return self.total_artif() / self.surface

    def percent(self, name):
        """Return the percent of the surface of the specified field

        Params:
            name: string, name of the field.
        """
        return getattr(self, name, 0.0) / self.surface

    def list_percent(self):
        """Return a list of all percent values in float.
        Can be casted to Decimal if parameter decimal=True"""
        return [_ / self.surface for _ in self.list_artif()]

    def __str__(self):
        return f"{self.name} - {self.insee}"


class CommunesSybarval(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    Communes_SYBARVAL : les communes avec les même attributs
    Données produites par Philippe
    """

    id_source = models.CharField("id", max_length=24)
    prec_plani = models.FloatField("prec_plani", max_length=6)
    nom = models.CharField("Nom", max_length=45)
    code_insee = models.CharField("Code INSEE", max_length=5)
    statut = models.CharField("statut", max_length=22)
    arrondisst = models.CharField("arrondisst", max_length=45)
    depart = models.CharField("departement", max_length=30)
    region = models.CharField("region", max_length=35)
    pop_2014 = models.IntegerField("Population 2014")
    pop_2015 = models.IntegerField("Population 2015")
    _commune = models.CharField("Commune", max_length=254)
    _n_arrdt = models.IntegerField("nb arrdt")
    _n_canton = models.IntegerField("nb cantons")
    _nom_epci = models.CharField("Nom EPCI", max_length=254)
    _siren_epc = models.IntegerField("siren epc")
    _nom_scot = models.CharField("Nom SCOT", max_length=254)
    surface = models.IntegerField("Surface")
    a_brute_20 = models.IntegerField("a_brute_20")
    a_b_2015_2 = models.IntegerField("a_b_2015_2")
    a_b_2018_2 = models.IntegerField("a_b_2018_2")
    z_baties_2 = models.IntegerField("z_baties_2")
    voirie_201 = models.IntegerField("voirie_201")
    tache_2018 = models.IntegerField("tache_2018")
    d_brute_20 = models.FloatField("d_brute_20")
    d_batie_20 = models.FloatField("d_batie_20")
    d_voirie_2 = models.FloatField("d_voirie_2")

    # GeoDjango-specific: a geometry field (MultiPolygonField)
    mpoly = models.MultiPolygonField()

    shape_file_path = "communes_sybarval.zip"
    default_property = "d_brute_20"
    default_color = "Yellow"
    mapping = {
        "id_source": "ID",
        "prec_plani": "PREC_PLANI",
        "nom": "NOM",
        "code_insee": "CODE_INSEE",
        "statut": "STATUT",
        "arrondisst": "ARRONDISST",
        "depart": "DEPART",
        "region": "REGION",
        "pop_2014": "Pop_2014",
        "_commune": "_Commune",
        "pop_2015": "Pop_2015",
        "_n_arrdt": "_N_arrdt",
        "_n_canton": "_N_canton",
        "_nom_epci": "_Nom_EPCI",
        "_siren_epc": "_SIREN_EPC",
        "_nom_scot": "_Nom_ScoT",
        "surface": "Surface",
        "a_brute_20": "A_Brute_20",
        "a_b_2015_2": "A_B_2015_2",
        "a_b_2018_2": "A_B_2018_2",
        "z_baties_2": "Z_Baties_2",
        "voirie_201": "Voirie_201",
        "tache_2018": "Tache_2018",
        "d_brute_20": "D_Brute_20",
        "d_batie_20": "D_Batie_20",
        "d_voirie_2": "D_Voirie_2",
        "mpoly": "MULTIPOLYGON",
    }

    # Returns the string representation of the model.
    def __str__(self):
        return self.nom


class Artificialisee2015to2018(AutoLoadMixin, DataColorationMixin, models.Model):
    """
    A_B_2015_2018 : la surface (en hectares) artificialisée entre 2015 et 2018
    Données construites par Philippe
    """

    surface = models.IntegerField("surface")
    cs_2018 = models.CharField("Couverture 2018", max_length=254, null=True)
    us_2018 = models.CharField("Usage 2018", max_length=254, null=True)
    cs_2015 = models.CharField("Couverture 2015", max_length=254, null=True)
    us_2015 = models.CharField("Usage 2015", max_length=254, null=True)

    # calculated fields
    cs_2018_label = models.CharField(
        "Couverture 2018", max_length=254, blank=True, null=True
    )
    us_2018_label = models.CharField(
        "Usage 2018", max_length=254, blank=True, null=True
    )
    cs_2015_label = models.CharField(
        "Couverture 2015", max_length=254, blank=True, null=True
    )
    us_2015_label = models.CharField(
        "Usage 2015", max_length=254, blank=True, null=True
    )

    mpoly = models.MultiPolygonField()

    shape_file_path = "a_b_2015_2018.zip"
    default_property = "surface"
    default_color = "Red"
    mapping = {
        "surface": "Surface",
        "cs_2018": "cs_2018",
        "us_2018": "us_2018",
        "cs_2015": "cs_2015",
        "us_2015": "us_2015",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def calculate_fields(cls):
        """override to hook specific label setting."""
        cls.set_labels()

    @classmethod
    def set_labels(cls):
        """Set label for cs and us fields."""
        for fieldname in ["cs_2018", "us_2018", "cs_2015", "us_2015"]:
            if fieldname.startswith("cs"):
                cls.set_label(CouvertureSol, fieldname, f"{fieldname}_label")
            else:
                cls.set_label(UsageSol, fieldname, f"{fieldname}_label")


class Renaturee2018to2015(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    A_B_2018_2015 : la surface (en hectares) re-naturée entre 2018 et 2015
    Données produites par Philippe
    """

    surface = models.IntegerField("Surface")
    cs_2018 = models.CharField("Couverture 2018", max_length=254, null=True)
    us_2018 = models.CharField("Usage 2018", max_length=254, null=True)
    cs_2015 = models.CharField("Couverture 2015", max_length=254, null=True)
    us_2015 = models.CharField("Usage 2015", max_length=254, null=True)

    # calculated fields
    cs_2018_label = models.CharField(
        "Couverture 2018", max_length=254, blank=True, null=True
    )
    us_2018_label = models.CharField(
        "Usage 2018", max_length=254, blank=True, null=True
    )
    cs_2015_label = models.CharField(
        "Couverture 2015", max_length=254, blank=True, null=True
    )
    us_2015_label = models.CharField(
        "Usage 2015", max_length=254, blank=True, null=True
    )

    mpoly = models.MultiPolygonField()

    shape_file_path = "a_b_2018_2015.zip"
    default_property = "surface"
    default_color = "Lime"
    mapping = {
        "surface": "Surface",
        "cs_2018": "cs_2018",
        "us_2018": "us_2018",
        "cs_2015": "cs_2015",
        "us_2015": "us_2015",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def calculate_fields(cls):
        """override to hook specific label setting."""
        cls.set_labels()

    @classmethod
    def set_labels(cls):
        """Set label for cs and us fields."""
        for fieldname in ["cs_2018", "us_2018", "cs_2015", "us_2015"]:
            if fieldname.startswith("cs"):
                cls.set_label(CouvertureSol, fieldname, f"{fieldname}_label")
            else:
                cls.set_label(UsageSol, fieldname, f"{fieldname}_label")

    @classmethod
    def get_groupby_couverture(cls, geom):
        """Return SUM(surface) GROUP BY couverture if coveredby geom.
        Return [
            {
                "couverture": "1.1.1",
                "total_surface": 678,
            },
        ]
        """
        qs = cls.objects.filter(mpoly__coveredby=geom)
        qs = qs.annotate(couverture=F("cs_2018"))
        qs = qs.values("couverture").order_by("couverture")
        qs = qs.annotate(total_surface=Sum("surface"))
        return qs


class Artificielle2018(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    A_Brute_2018 : la surface artificialisée en hectare
    Données produites par Philippe
    """

    couverture = models.CharField("Couverture", max_length=254)
    surface = models.IntegerField("Surface")

    # Calculated fields
    couverture_label = models.CharField(
        "Libellé couverture du sol", max_length=254, blank=True, null=True
    )

    mpoly = models.MultiPolygonField()

    shape_file_path = "A_Brute_2018.zip"
    default_property = "surface"
    default_color = "Orange"
    couverture_field = "couverture"
    mapping = {
        "couverture": "couverture",
        "surface": "Surface",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def get_groupby_couverture(cls, geom):
        """Return SUM(surface) GROUP BY couverture if coveredby geom.
        Return [
            {
                "couverture": "1.1.1",
                "total_surface": 678,
            },
        ]
        """
        qs = cls.objects.filter(mpoly__coveredby=geom)
        qs = qs.values("couverture").order_by("couverture")
        qs = qs.annotate(total_surface=Sum("surface"))
        return qs


class EnveloppeUrbaine2018(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    Enveloppe_Urbaine_2018 : enveloppe urbaine sans la voirie avec moins d'attributs
    """

    couverture = models.CharField("Couverture", max_length=254, null=True)
    surface = models.IntegerField("Surface")
    a_brute_20 = models.IntegerField("a_brute_20", null=True)
    z_batie_20 = models.IntegerField("z_batie_20", null=True)
    d_brute_20 = models.FloatField("d_brute_20", null=True)
    d_batie_20 = models.FloatField("d_batie_20", null=True)

    mpoly = models.MultiPolygonField()

    # calculated fields
    couverture_label = models.CharField(
        "Libellé couverture du sol", max_length=254, blank=True, null=True
    )

    shape_file_path = "Enveloppe_urbaine.zip"
    default_property = "surface"
    default_color = "Coraile"
    couverture_field = "couverture"
    mapping = {
        "couverture": "couverture",
        "surface": "Surface",
        "a_brute_20": "A_Brute_20",
        "z_batie_20": "Z_Batie_20",
        "d_brute_20": "D_Brute_20",
        "d_batie_20": "D_Batie_20",
        "mpoly": "MULTIPOLYGON",
    }


class Voirie2018(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    Voirie_2018 : les objets avec leur surface
    """

    couverture = models.CharField("Couverture", max_length=254, null=True)
    usage = models.CharField("Usage", max_length=254, null=True)
    surface = models.IntegerField("Surface")

    mpoly = models.MultiPolygonField()

    # calculated fields
    couverture_label = models.CharField(
        "Libellé couverture du sol", max_length=254, blank=True, null=True
    )
    usage_label = models.CharField(
        "Libellé usage du sol", max_length=254, blank=True, null=True
    )

    shape_file_path = "Voirire_2018.zip"
    default_property = "surface"
    default_color = "Black"
    couverture_field = "couverture"
    usage_field = "usage"
    mapping = {
        "couverture": "couverture",
        "usage": "usage",
        "surface": "Surface",
        "mpoly": "MULTIPOLYGON",
    }


class ZonesBaties2018(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    Zones_Baties_2018 : les objets avec leur surface
    Données produites par Philippe
    """

    couverture = models.CharField("Couverture", max_length=254, null=True)
    usage = models.CharField("Usage", max_length=254, null=True)
    surface = models.IntegerField("Surface")

    mpoly = models.MultiPolygonField()

    # calculated fields
    couverture_label = models.CharField(
        "Libellé couverture du sol", max_length=254, blank=True, null=True
    )
    usage_label = models.CharField(
        "Libellé usage du sol", max_length=254, blank=True, null=True
    )

    shape_file_path = "zones_baties_2018.zip"
    default_property = "surface"
    default_color = "Pink"
    couverture_field = "couverture"
    usage_field = "usage"
    mapping = {
        "couverture": "couverture",
        "usage": "usage",
        "surface": "Surface",
        "mpoly": "MULTIPOLYGON",
    }


class Sybarval(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    SYBARVAL : les contours et les attributs utiles (seulement pour 2018) :
        - Surface en hectare
        - A_Brute_2018 : la surface artificialisée en hectare
        - A_B_2015_2018 : la surface (en hectares) artificialisée entre 2015 et 2018
        - A_B_2018_2015 : la surface (en hectares) re-naturée entre 2018 et 2015
        - Z_Baties_2018 : la surface bâtie en hectares
        - Voirie_2018 : la surface de voirie en hectares
        - Tache_2018 : la surface en hectares de l'enveloppe urbaine 2018
        - D_Brute_2018, D_Batie_2018 et D_Voirie_2018 : les densités
    Données produites par Philippe
    """

    surface = models.IntegerField("Surface")
    a_brute_20 = models.IntegerField("a_brute_20", null=True)
    a_b_2015_2 = models.IntegerField("a_b_2015_2", null=True)
    a_b_2018_2 = models.IntegerField("a_b_2018_2", null=True)
    z_baties_2 = models.IntegerField("z_baties_2", null=True)
    voirie_201 = models.IntegerField("voirie_201", null=True)
    tache_2018 = models.IntegerField("tache_2018", null=True)
    d_brute_20 = models.FloatField("d_brute_20", null=True)
    d_batie_20 = models.FloatField("d_batie_20", null=True)
    d_voirie_2 = models.FloatField("d_voirie_2", null=True)

    mpoly = models.MultiPolygonField()

    shape_file_path = "Sybarval.zip"
    default_property = "surface"
    default_color = None
    mapping = {
        "surface": "Surface",
        "a_brute_20": "A_Brute_20",
        "a_b_2015_2": "A_B_2015_2",
        "a_b_2018_2": "A_B_2018_2",
        "z_baties_2": "Z_Baties_2",
        "voirie_201": "Voirie_201",
        "tache_2018": "Tache_2018",
        "d_brute_20": "D_Brute_20",
        "d_batie_20": "D_Batie_20",
        "d_voirie_2": "D_voirie_2",
        "mpoly": "MULTIPOLYGON",
    }
