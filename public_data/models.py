from pathlib import Path

from django.contrib.gis.db import models
from django.contrib.gis.utils import LayerMapping
from django.utils.translation import gettext_lazy as _


class AutoLoad(models.Model):
    """
    Enable auto loading of data into database according to
    * file_path - usually shape file is in media directory
    * mapping - between feature name and database field name
    Those two needs to be overloaded.

    Inheritance:
        django.contrib.gis.db.models.Model
    """

    shape_file_path = Path()
    mapping = dict()

    @classmethod
    def load(cls, verbose=True):
        """
        Populate table with data from shapefile

        Args:
            cls (undefined): default class calling
            verbose=True (undefined): define level of verbosity

        """
        cls.objects.all().delete()
        lm = LayerMapping(cls, cls.shape_file_path, cls.mapping, transform=False)
        lm.save(strict=True, verbose=verbose)

    class Meta:
        abstract = True


class CommunesSybarval(AutoLoad):
    """
    Description of CommunesSybarval

    Inheritance:
        AutoLoad: load data from shape_file

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
    d_brute_20 = models.FloatField(_("d_brute_20"), max_length=24)
    d_batie_20 = models.FloatField(_("d_batie_20"), max_length=24)
    d_voirie_2 = models.FloatField(_("d_voirie_2"), max_length=24)

    # GeoDjango-specific: a geometry field (MultiPolygonField)
    mpoly = models.MultiPolygonField()

    shape_file_path = Path("public_data/media/communes_sybarval/Communes_SYBARVAL.shp")
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
