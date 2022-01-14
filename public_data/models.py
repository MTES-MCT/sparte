from decimal import Decimal
import re

from django.contrib.gis.db import models
from django.contrib.gis.db.models.functions import Intersection, Area, Transform
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models as classic_models
from django.db.models import F, Sum

from .behaviors import AutoLoadMixin, DataColorationMixin


class ArtifCommune(classic_models.Model):
    name = classic_models.CharField("Nom", max_length=250)
    insee = classic_models.CharField("Code INSEE", max_length=10)
    surface = classic_models.DecimalField(
        "surface (ha)", max_digits=8, decimal_places=2
    )
    artif_before_2009 = classic_models.DecimalField(
        "Artificial before 2009 (ha)", max_digits=8, decimal_places=2
    )
    artif_2009 = classic_models.DecimalField(
        "New artificial 2009 (ha)", max_digits=8, decimal_places=2
    )
    artif_2010 = classic_models.DecimalField(
        "New artificial 2010 (ha)", max_digits=8, decimal_places=2
    )
    artif_2011 = classic_models.DecimalField(
        "New artificial 2011 (ha)", max_digits=8, decimal_places=2
    )
    artif_2012 = classic_models.DecimalField(
        "New artificial 2012 (ha)", max_digits=8, decimal_places=2
    )
    artif_2013 = classic_models.DecimalField(
        "New artificial 2013 (ha)", max_digits=8, decimal_places=2
    )
    artif_2014 = classic_models.DecimalField(
        "New artificial 2014 (ha)", max_digits=8, decimal_places=2
    )
    artif_2015 = classic_models.DecimalField(
        "New artificial 2015 (ha)", max_digits=8, decimal_places=2
    )
    artif_2016 = classic_models.DecimalField(
        "New artificial 2016 (ha)", max_digits=8, decimal_places=2
    )
    artif_2017 = classic_models.DecimalField(
        "New artificial 2017 (ha)", max_digits=8, decimal_places=2
    )
    artif_2018 = classic_models.DecimalField(
        "New artificial 2018 (ha)", max_digits=8, decimal_places=2
    )

    @classmethod
    def list_attr(cls):
        """Return all field names with a artif numerical values
        Usefull to get an easy way to change available data withou changing the
        code"""
        return ["artif_before_2009"] + [f"artif_{y}" for y in range(2009, 2019)]

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


class Artificialisee2015to2018(models.Model, AutoLoadMixin, DataColorationMixin):
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
        qs = qs.annotate(couverture=classic_models.F("cs_2018"))
        qs = qs.values("couverture").order_by("couverture")
        qs = qs.annotate(total_surface=classic_models.Sum("surface"))
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
        qs = qs.annotate(total_surface=classic_models.Sum("surface"))
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


class BaseSol(classic_models.Model):
    class Meta:
        abstract = True

    code_prefix = classic_models.CharField(
        "Nomenclature préfixée", max_length=10, unique=True
    )
    code = classic_models.CharField("Nomenclature", max_length=8, unique=True)
    label = classic_models.CharField("Libellé", max_length=250)
    map_color = models.CharField("Couleur", max_length=8, blank=True, null=True)

    @property
    def level(self) -> int:
        """Return the level of the instance in the tree
        CS1 => 1
        CS1.1 => 2
        CS1.1.1.1 => 4
        """
        return len(self.code.split("."))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cached_children = None
        self.cached_parent = None
        self.total_surface = dict()

    @property
    def children(self):
        raise NotImplementedError("Needs to be overrided")

    def get_children(self):
        """Ensure Django does not reload data from databases, therefore we can
        add some calculated data on the fly."""
        if not self.cached_children:
            self.cached_children = self.children.all()
        return self.cached_children

    @property
    def parent(self):
        raise NotImplementedError("Needs to be overrided")

    def get_parent(self):
        """Same as get_children, cache the parent to ensure django don't reload it"""
        if not self.cached_parent:
            self.cached_parent = self.parent
        return self.cached_parent

    def set_parent(self):
        """Probably useless now, calculate the parent of it.
        Example: return 'us1.2' for 'us1.2.2'
        """
        if len(self.code) < 3:
            return
        try:
            self.parent = self.__class__.objects.get(code=self.code[:-2])
            self.save()
        except self.DoesNotExist:
            return

    def __str__(self):
        return f"{self.code_prefix} {self.label}"


class UsageSol(BaseSol):
    parent = classic_models.ForeignKey(
        "UsageSol",
        blank=True,
        null=True,
        on_delete=classic_models.PROTECT,
        related_name="children",
    )


class CouvertureSol(BaseSol):
    parent = classic_models.ForeignKey(
        "CouvertureSol",
        blank=True,
        null=True,
        on_delete=classic_models.PROTECT,
        related_name="children",
    )


class CouvertureUsageMatrix(classic_models.Model):
    class LabelChoices(classic_models.TextChoices):
        ARTIFICIAL = "ARTIF", "Artificiel"
        CONSUMED = "CONSU", "Consommé"
        NAF = "NAF", "NAF"
        ARTIF_NOT_CONSUMED = "ARTIF_NOT_CONSU", "Artificiel non consommé"
        NONE = "NONE", "Non renseigné"

    couverture = classic_models.ForeignKey(
        "CouvertureSol", on_delete=classic_models.PROTECT
    )
    usage = classic_models.ForeignKey("UsageSol", on_delete=classic_models.PROTECT)
    is_artificial = classic_models.BooleanField("Artificiel", default=False)
    is_consumed = classic_models.BooleanField("Consommé", default=False)
    is_natural = classic_models.BooleanField("Naturel", default=False)
    label = classic_models.CharField(
        "Libellé",
        max_length=20,
        choices=LabelChoices.choices,
        default=LabelChoices.NONE,
    )

    def compute(self):
        """Set is_field to correct boolean value according to label"""
        self.is_artificial = self.is_consumed = self.is_natural = False
        if self.label == self.LabelChoices.ARTIFICIAL:
            self.is_artificial = True
            self.is_consumed = True
        elif self.label == self.LabelChoices.ARTIF_NOT_CONSUMED:
            self.is_artificial = True
        elif self.label == self.LabelChoices.CONSUMED:
            self.is_consumed = True
            self.is_natural = True
        elif self.label == self.LabelChoices.NAF:
            self.is_natural = True

    def __str__(self):
        us = self.usage.code_prefix
        cs = self.couverture.code_prefix
        a = "a" if self.is_artificial else ""
        c = "c" if self.is_consumed else ""
        n = "n" if self.is_natural else ""
        return f"{cs}-{us}:{a}{c}{n}"


class Ocsge(AutoLoadMixin, DataColorationMixin, models.Model):
    couverture = models.CharField(
        "Couverture du sol", max_length=254, blank=True, null=True
    )
    usage = models.CharField("Usage du sol", max_length=254, blank=True, null=True)
    # TODO is_artificial = models.IntegerField("Sureface artificialisée", null=True)
    millesime = models.DateField("Millésime", blank=True, null=True)
    source = models.CharField("Source", max_length=254, blank=True, null=True)
    origine = models.CharField("Origine", max_length=254, blank=True, null=True)
    origine2 = models.CharField("Origine1", max_length=254, blank=True, null=True)
    ossature = models.IntegerField("Ossature", blank=True, null=True)
    commentaire = models.CharField("Commentaire", max_length=254, blank=True, null=True)
    year = models.IntegerField(
        "Année", validators=[MinValueValidator(2000), MaxValueValidator(2050)]
    )

    # calculated fields
    couverture_label = models.CharField(
        "Libellé couverture du sol", max_length=254, blank=True, null=True
    )
    usage_label = models.CharField(
        "Libellé usage du sol", max_length=254, blank=True, null=True
    )
    map_color = models.CharField("Couleur", max_length=8, blank=True, null=True)

    mpoly = models.MultiPolygonField()

    default_property = "id"
    couverture_field = "couverture"
    usage_field = "usage"
    mapping = {
        "couverture": "couverture",
        "usage": "usage",
        "millesime": "millesime",
        "source": "source",
        "origine": "origine",
        "origine2": "origine2",
        "ossature": "ossature",
        "commentaire": "commentair",
        "mpoly": "MULTIPOLYGON",
    }

    class Meta:
        indexes = [
            models.Index(fields=["couverture"]),
            models.Index(fields=["usage"]),
        ]

    @classmethod
    def get_groupby(cls, field_group_by, coveredby, year):
        """Return SUM(surface) GROUP BY couverture if coveredby geom.
        Return {
            "CS1.1.1": 678,
            "CS1.1.2": 419,
        }

        Parameters:
        ==========
        * field_group_by: 'couverture' or 'usage'
        * coveredby: polynome of the perimeter in which Ocsge items mut be
        """
        qs = cls.objects.filter(year=year)
        qs = qs.filter(mpoly__intersects=coveredby)
        qs = qs.annotate(intersection=Intersection("mpoly", coveredby))
        qs = qs.annotate(surface=Area(Transform("intersection", 2154)))
        qs = qs.values(field_group_by).order_by(field_group_by)
        qs = qs.annotate(total_surface=classic_models.Sum("surface"))
        data = {_[field_group_by]: _["total_surface"].sq_km for _ in qs}
        return data

    @classmethod
    def get_year(cls):
        raise NotImplementedError("Need to be overrided to return a year")


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


class Cerema(AutoLoadMixin, DataColorationMixin, models.Model):
    """
    Récupérée le 16/12/2021
    https://cerema.app.box.com/v/pnb-action7-indicateurs-ff/folder/149684581362
    Description des changements cadastraux agrégé au niveau de la commune
    Donne la consommation d'espace.
    Voir PDF dans lien ci-dessus
    """

    city_insee = models.CharField(max_length=5)
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

    # GeoDjango-specific: a geometry field (MultiPolygonField)
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
        "naf19art20": "NAF19ART20",  # 2019
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

    naf11art21 = models.FloatField(null=True)

    def __str__(self):
        return self.city_insee

    @classmethod
    def calculate_fields(cls):
        """
        Calculate fields to speedup user consultation
        ..warning:: 2021 is missing in the sum because data are missing.
        ..TODO:: update data to get 2021 and change sum.
        """
        fields = cls.get_art_field(2011, 2020)
        kwargs = {"naf11art21": sum([F(f) for f in fields])}
        cls.objects.update(**kwargs)

    @classmethod
    def get_art_field(self, start="2010", end="2020"):
        """Return field name list of nafAAartAA (where AA are years) between
        2 years included.

        ..Examples:
        ```
        >>> Cerema.get_art_field(2015, 2018)
        ['naf14art15', 'naf15art16', 'naf16art17', 'naf17art18']
        >>> Cerema.get_art_field(2014, 2014)
        ['naf13art14']
        >>> Cerema.get_art_field(2008, 2021)
        Exception: ValueError
        ```
        """
        end = int(end) - 2000
        start = int(start) - 2000
        if not 10 <= start <= 20:
            raise ValueError("'start' must be between 2010 and 2020")
        if not 10 <= end <= 20:
            raise ValueError("'end' must be between 2010 and 2020")
        if end < start:
            raise ValueError("start must be <= to end")
        return [f"naf{i-1:0>2}art{i:0>2}" for i in range(start, end + 1)]

    @classmethod
    def list_attr(cls):
        """Return all field names with a artif numerical values
        Usefull to get an easy way to change available data withou changing the
        code
        From : naf09art10 (year 2009) to naf19art20 (year 2020)
        """
        return [f"naf{y:0>2}art{y+1:0>2}" for y in range(9, 19)]


class RefPlan(Cerema):
    """
    !!! DEPRECATED !!!
    Available for compatibility
    """

    class Meta:
        proxy = True


# ----- BELOW ARE FRANCE ADMINISTRATIVE LAND ORGANISATION ------
"""
public_key is a way to refere to a land without knowing exactly what class
it is. It is build as [level]_[id]. Each level is a model described below.
Here the following level available:
EPCI_[ID]
DEPART_[ID] (département)
REGION_[ID]
COMMUNE_[ID]
"""


class Land:
    """It's a generic class to work with Epci, Departement, Region or Commune.
    Like a proxy."""

    def __init__(self, public_key):
        self.public_key = public_key
        land_type, id = public_key.strip().split("_")
        klass = self.get_land_class(land_type)
        self.land = klass.objects.get(pk=int(id))

    def get_conso_per_year(self, start="2010", end="2020"):
        return self.land.get_conso_per_year(start, end)

    def __getattr__(self, name):
        return getattr(self.land, name)

    def __str__(self):
        return f"Land({str(self.land)})"

    @classmethod
    def get_land_class(cls, land_type):
        transco = {
            "COMMUNE": Commune,
            "EPCI": Epci,
            "DEPART": Departement,
            "REGION": Region,
        }
        return transco[land_type.upper()]


class GetDataFromCeremaMixin:
    def get_qs_cerema(self):
        raise NotImplementedError("Need to be specified in child")

    def get_conso_per_year(self, start="2010", end="2020"):
        """Return Cerema data for the city, transposed and named after year"""
        fields = Cerema.get_art_field(start, end)
        qs = self.get_qs_cerema()
        args = (Sum(field) for field in fields)
        qs = qs.aggregate(*args)
        return {f"20{key[8:10]}": val for key, val in qs.items()}


class Region(GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=2)
    name = models.CharField("Nom", max_length=27)
    mpoly = models.MultiPolygonField()

    @property
    def public_key(self):
        return f"REGION_{self.id}"

    @property
    def is_artif_ready(self):
        is_artif_ready = True
        for dept in self.departement_set.all():
            is_artif_ready &= dept.is_artif_ready
        return is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(region_id=self.source_id)

    def __str__(self):
        return self.name


class Departement(GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=3)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    is_artif_ready = models.BooleanField("Données artif disponibles", default=False)
    ocsge_millesimes = models.CharField(
        "Millesimes OCSGE dispo", max_length=100, null=True
    )
    name = models.CharField("Nom", max_length=23)
    mpoly = models.MultiPolygonField()

    @property
    def public_key(self):
        return f"DEPART_{self.id}"

    @property
    def millesimes(self):
        if not self.ocsge_millesimes:
            return list()
        matches = re.finditer(r"([\d]{4,4})", self.ocsge_millesimes)
        return [int(m.group(0)) for m in matches]

    def get_qs_cerema(self):
        return Cerema.objects.filter(dept_id=self.source_id)

    def __str__(self):
        return self.name


class Epci(GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=9)
    name = models.CharField("Nom", max_length=64)
    mpoly = models.MultiPolygonField()
    departements = models.ManyToManyField(Departement)

    @property
    def public_key(self):
        return f"EPCI_{self.id}"

    @property
    def is_artif_ready(self):
        is_artif_ready = True
        for dept in self.departements.all():
            is_artif_ready &= dept.is_artif_ready
        return is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(epci_id=self.source_id)

    def __str__(self):
        return self.name


class Commune(GetDataFromCeremaMixin, models.Model):
    insee = models.CharField("Code INSEE", max_length=5)
    name = models.CharField("Nom", max_length=45)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)
    epci = models.ForeignKey(Epci, on_delete=models.CASCADE)
    mpoly = models.MultiPolygonField()

    @property
    def public_key(self):
        return f"COMMUNE_{self.id}"

    def get_qs_cerema(self):
        return Cerema.objects.filter(city_insee=self.insee)

    def __str__(self):
        return f"{self.name} ({self.insee})"
