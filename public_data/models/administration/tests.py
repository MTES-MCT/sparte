from django.db import connection
from django.test import TestCase

from utils.schema import init_unmanaged_schema_for_tests

from .Commune import Commune
from .Departement import Departement
from .Epci import Epci
from .Region import Region
from .Scot import Scot


class TestLandNaturalKeys(TestCase):
    def setUp(self) -> None:
        super().setUp()
        init_unmanaged_schema_for_tests()

        self.region_natural_key = "region"
        self.first_departement_natural_key = "departemen1"
        self.second_departement_natural_key = "departemen2"
        self.first_epci_natural_key = "epci1"
        self.first_scot_natural_key = "scot1"
        self.first_commune_natural_key = "11111"
        self.second_commune_natural_key = "22222"

        self.region = Region.objects.create(
            name="Region",
            source_id=self.region_natural_key,
            mpoly="MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))",
            srid_source=2154,
        )
        self.first_departement = Departement.objects.create(
            name="Premier département",
            source_id=self.first_departement_natural_key,
            mpoly="MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))",
            region=self.region,
            srid_source=2154,
            is_artif_ready=False,
            ocsge_millesimes=None,
        )
        self.second_departement = Departement.objects.create(
            name="Second département",
            source_id=self.second_departement_natural_key,
            mpoly="MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))",
            region=self.region,
            srid_source=2154,
            is_artif_ready=False,
            ocsge_millesimes=None,
        )
        self.first_epci = Epci.objects.create(
            name="Premier Epci",
            source_id=self.first_epci_natural_key,
            mpoly="MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))",
            srid_source=2154,
        )

        self.first_epci.departements.add(self.first_departement)
        self.first_epci.departements.add(self.second_departement)

        self.first_scot = Scot.objects.create(
            name="Premier Scot",
            siren="Some siren",
            source_id=self.first_scot_natural_key,
            mpoly="MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))",
            srid_source=2154,
        )

        self.first_scot.departements.add(self.first_departement)
        self.first_scot.departements.add(self.second_departement)
        self.first_scot.regions.add(self.region)

        self.first_commune = Commune.objects.create(
            name="Première commune",
            insee=self.first_commune_natural_key,
            mpoly="MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))",
            srid_source=2154,
            departement=self.first_departement,
            scot=self.first_scot,
            first_millesime=None,
            last_millesime=None,
            area=15.0,
            surface_artif=None,
            ocsge_available=False,
            epci=self.first_epci,
        )

        self.second_commune = Commune.objects.create(
            name="Deuxième commune",
            insee=self.second_commune_natural_key,
            mpoly="MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))",
            srid_source=2154,
            departement=self.second_departement,
            scot=self.first_scot,
            first_millesime=None,
            last_millesime=None,
            area=15.0,
            surface_artif=None,
            ocsge_available=False,
            epci=self.first_epci,
        )

    # get_by_natural_key tests

    def test_region_get_by_natural_key(self):
        self.assertEqual(self.region, Region.objects.get_by_natural_key(self.region_natural_key))

    def test_departement_get_by_natural_key(self):
        self.assertEqual(
            self.first_departement, Departement.objects.get_by_natural_key(self.first_departement_natural_key)
        )
        self.assertEqual(
            self.second_departement, Departement.objects.get_by_natural_key(self.second_departement_natural_key)
        )

    def test_epci_get_by_natural_key(self):
        self.assertEqual(self.first_epci, Epci.objects.get_by_natural_key(self.first_epci_natural_key))

    def test_scot_get_by_natural_key(self):
        self.assertEqual(self.first_scot, Scot.objects.get_by_natural_key(self.first_scot_natural_key))

    def test_commune_get_by_natural_key(self):
        self.assertEqual(self.first_commune, Commune.objects.get_by_natural_key(self.first_commune_natural_key))
        self.assertEqual(self.second_commune, Commune.objects.get_by_natural_key(self.second_commune_natural_key))

    # foreign key tests

    def test_departement_region_foreign_key(self):
        self.assertEqual(self.first_departement.region_id, self.region_natural_key)

    def test_commune_scot_foreign_key(self):
        self.assertEqual(self.first_commune.scot_id, self.first_scot_natural_key)

    def test_commune_epci_foreign_key(self):
        self.assertEqual(self.first_commune.epci_id, self.first_epci_natural_key)

    # test many to many
    def test_epci_departements_many_to_many(self):
        expected_result = [
            (1, self.first_epci_natural_key, self.first_departement_natural_key),
            (2, self.first_epci_natural_key, self.second_departement_natural_key),
        ]
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from public_data_epci_departements")
            result = cursor.fetchall()
            self.assertEqual(result, expected_result)

    def test_scot_departements_many_to_many(self):
        expected_result = [
            (1, self.first_scot_natural_key, self.first_departement_natural_key),
            (2, self.first_scot_natural_key, self.second_departement_natural_key),
        ]
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from public_data_scot_departements")
            result = cursor.fetchall()
            self.assertEqual(result, expected_result)

    def test_scot_regions_many_to_many(self):
        expected_result = [
            (1, self.first_scot_natural_key, self.region_natural_key),
        ]
        with connection.cursor() as cursor:
            cursor.execute("SELECT * from public_data_scot_regions")
            result = cursor.fetchall()
            self.assertEqual(result, expected_result)

    # test set
    def test_region_departement_set(self):
        self.assertEqual(
            set(self.region.departement_set.all()),
            set(Departement.objects.all()),
        )

    def test_region_scot_set(self):
        self.assertEqual(
            set(self.region.scot_set.all()),
            set(Scot.objects.all()),
        )

    def test_departement_commune_set(self):
        self.assertEqual(
            set(self.first_departement.commune_set.all()),
            set(Commune.objects.filter(insee=self.first_commune_natural_key)),
        )

    def test_epci_commune_set(self):
        self.assertEqual(
            set(self.first_epci.commune_set.all()),
            set(Commune.objects.all()),
        )

    def test_scot_commune_set(self):
        self.assertEqual(
            set(self.first_scot.commune_set.all()),
            set(Commune.objects.all()),
        )

    def test_departement_epci_set(self):
        self.assertEqual(
            set(self.first_departement.epci_set.all()),
            set(Epci.objects.filter(source_id=self.first_epci_natural_key)),
        )

    def test_departement_scot_set(self):
        self.assertEqual(
            set(self.first_departement.scot_set.all()),
            set(Scot.objects.filter(source_id=self.first_scot_natural_key)),
        )
