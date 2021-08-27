from decimal import Decimal
from pathlib import Path

from django.contrib.gis.db import models
from django.db import models as classic_models
from django.utils.translation import gettext_lazy as _

from .behaviors import AutoLoadMixin, DataColorationMixin


class ArtifCommune(classic_models.Model):
    name = classic_models.CharField(_("Name"), max_length=250)
    insee = classic_models.CharField(_("code INSEE"), max_length=10)
    surface = classic_models.DecimalField(
        _("surface (ha)"), max_digits=8, decimal_places=2
    )
    artif_before_2009 = classic_models.DecimalField(
        _("Artificial before 2009 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2009 = classic_models.DecimalField(
        _("New artificial 2009 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2010 = classic_models.DecimalField(
        _("New artificial 2010 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2011 = classic_models.DecimalField(
        _("New artificial 2011 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2012 = classic_models.DecimalField(
        _("New artificial 2012 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2013 = classic_models.DecimalField(
        _("New artificial 2013 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2014 = classic_models.DecimalField(
        _("New artificial 2014 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2015 = classic_models.DecimalField(
        _("New artificial 2015 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2016 = classic_models.DecimalField(
        _("New artificial 2016 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2017 = classic_models.DecimalField(
        _("New artificial 2017 (ha)"), max_digits=8, decimal_places=2
    )
    artif_2018 = classic_models.DecimalField(
        _("New artificial 2018 (ha)"), max_digits=8, decimal_places=2
    )

    def list_artif(self):
        val = [
            self.artif_before_2009,
        ]
        val += [getattr(self, f"artif_{y}", 0.0) for y in range(2009, 2019)]
        return val

    def total_artif(self):
        return sum(self.list_artif())

    def total_percent(self, decimal=False):
        val = self.total_artif() / self.surface
        if not decimal:
            return val
        else:
            return Decimal(val)

    def percent(self, name, decimal=False):
        val = getattr(self, name, 0.0) / self.surface
        if not decimal:
            return val
        else:
            return Decimal(val)

    def list_percent(self, decimal=False):
        val = (_ / self.surface for _ in self.list_artif())
        if not decimal:
            return val
        else:
            return map(Decimal, val)

    def __str__(self):
        return f"{self.name} - {self.insee}"


class CommunesSybarval(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    Communes_SYBARVAL : les communes avec les même attributs
    Données produites par Philippe
    """

    id_source = models.CharField(_("id"), max_length=24)
    prec_plani = models.FloatField(_("prec_plani"), max_length=6)
    nom = models.CharField(_("nom"), max_length=45)
    code_insee = models.CharField(_("code_insee"), max_length=5)
    statut = models.CharField(_("statut"), max_length=22)
    arrondisst = models.CharField(_("arrondisst"), max_length=45)
    depart = models.CharField(_("depart"), max_length=30)
    region = models.CharField(_("region"), max_length=35)
    pop_2014 = models.IntegerField(_("pop_2014"))
    pop_2015 = models.IntegerField(_("pop_2015"))
    _commune = models.CharField(_("_commune"), max_length=254)
    _n_arrdt = models.IntegerField(_("_n_arrdt"))
    _n_canton = models.IntegerField(_("_n_canton"))
    _nom_epci = models.CharField(_("_nom_epci"), max_length=254)
    _siren_epc = models.IntegerField(_("_siren_epc"))
    _nom_scot = models.CharField(_("_nom_scot"), max_length=254)
    surface = models.IntegerField(_("surface"))
    a_brute_20 = models.IntegerField(_("a_brute_20"))
    a_b_2015_2 = models.IntegerField(_("a_b_2015_2"))
    a_b_2018_2 = models.IntegerField(_("a_b_2018_2"))
    z_baties_2 = models.IntegerField(_("z_baties_2"))
    voirie_201 = models.IntegerField(_("voirie_201"))
    tache_2018 = models.IntegerField(_("tache_2018"))
    d_brute_20 = models.FloatField(_("d_brute_20"))
    d_batie_20 = models.FloatField(_("d_batie_20"))
    d_voirie_2 = models.FloatField(_("d_voirie_2"))

    # GeoDjango-specific: a geometry field (MultiPolygonField)
    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/communes_sybarval/Communes_SYBARVAL.shp")
    default_property = "surface"
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

    surface = models.IntegerField(_("surface"))
    cs_2018 = models.CharField(_("cs_2018"), max_length=254, null=True)
    us_2018 = models.CharField(_("us_2018"), max_length=254, null=True)
    cs_2015 = models.CharField(_("cs_2015"), max_length=254, null=True)
    us_2015 = models.CharField(_("us_2015"), max_length=254, null=True)

    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/a_b_2015_2018/A_B_2015_2018.shp")
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


class Renaturee2018to2015(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    A_B_2018_2015 : la surface (en hectares) re-naturée entre 2018 et 2015
    Données produites par Philippe
    """

    surface = models.IntegerField(_("surface"))
    cs_2018 = models.CharField(_("cs_2018"), max_length=254, null=True)
    us_2018 = models.CharField(_("us_2018"), max_length=254, null=True)
    cs_2015 = models.CharField(_("cs_2015"), max_length=254, null=True)
    us_2015 = models.CharField(_("us_2015"), max_length=254, null=True)

    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/a_b_2018_2015/A_B_2018_2015.shp")
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


class Artificielle2018(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    A_Brute_2018 : la surface artificialisée en hectare
    Données produites par Philippe
    """

    couverture = models.CharField(_("couverture"), max_length=254)
    surface = models.IntegerField(_("surface"))

    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/A_Brute_2018/A_Brute_2018.shp")
    default_property = "surface"
    default_color = "Orange"
    mapping = {
        "couverture": "couverture",
        "surface": "Surface",
        "mpoly": "MULTIPOLYGON",
    }


class EnveloppeUrbaine2018(models.Model, AutoLoadMixin, DataColorationMixin):
    """
    Enveloppe_Urbaine_2018 : enveloppe urbaine sans la voirie avec moins d'attributs
    """

    couverture = models.CharField(_("couverture"), max_length=254, null=True)
    surface = models.IntegerField(_("surface"))
    a_brute_20 = models.IntegerField(_("a_brute_20"), null=True)
    z_batie_20 = models.IntegerField(_("z_batie_20"), null=True)
    d_brute_20 = models.FloatField(_("d_brute_20"), null=True)
    d_batie_20 = models.FloatField(_("d_batie_20"), null=True)

    mpoly = models.MultiPolygonField()

    shape_file_path = Path(
        "public_data/media/Enveloppe_urbaine/Enveloppe_Urbaine_2018.shp"
    )
    default_property = "surface"
    default_color = "Coraile"
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

    couverture = models.CharField(_("couverture"), max_length=254, null=True)
    usage = models.CharField(_("usage"), max_length=254, null=True)
    surface = models.IntegerField(_("surface"))

    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/Voirire_2018/Voirie_2018.shp")
    default_property = "surface"
    default_color = "Black"
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

    couverture = models.CharField(_("couverture"), max_length=254, null=True)
    usage = models.CharField(_("usage"), max_length=254, null=True)
    surface = models.IntegerField(_("surface"))

    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/zones_baties_2018/Zones_Baties_2018.shp")
    default_property = "surface"
    default_color = "Pink"
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

    surface = models.IntegerField(_("surface"))
    a_brute_20 = models.IntegerField(_("a_brute_20"), null=True)
    a_b_2015_2 = models.IntegerField(_("a_b_2015_2"), null=True)
    a_b_2018_2 = models.IntegerField(_("a_b_2018_2"), null=True)
    z_baties_2 = models.IntegerField(_("z_baties_2"), null=True)
    voirie_201 = models.IntegerField(_("voirie_201"), null=True)
    tache_2018 = models.IntegerField(_("tache_2018"), null=True)
    d_brute_20 = models.FloatField(_("d_brute_20"), null=True)
    d_batie_20 = models.FloatField(_("d_batie_20"), null=True)
    d_voirie_2 = models.FloatField(_("d_voirie_2"), null=True)

    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/Sybarval/SYBARVAL.shp")
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
