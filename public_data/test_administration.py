import pytest

# from django.contrib.gis.geos import MultiPolygon
from django.contrib.gis.geos import GEOSGeometry

from public_data.models.administration import (
    Commune,
    CommunePop,
    Departement,
    Epci,
    Region,
)

# from .validators import MinValueValidator, MaxValueValidator


# SQUARE = MultiPolygon([((2.2, 4.2), (5.2, 4.2), (5.2, 6.6), (2.2, 6.6), (2.2, 4.2))], srid=4326)
# SQUARE = MultiPolygon([((2.2, 4.2), (5.2, 4.2), (5.2, 6.6), (2.2, 6.6), (2.2, 4.2))], srid='4326')
SQUARE = GEOSGeometry("MULTIPOLYGON(((2.2 4.2, 5.2 4.2, 5.2 6.6, 2.2 6.6, 2.2 4.2)))", srid=4326)


@pytest.fixture
def setup_administration_level():
    region = Region.objects.create(
        source_id="TestRegion",
        name="TestRegion",
        mpoly=SQUARE,
    )
    dept = Departement.objects.create(
        source_id="TestDepartement",
        name="TestDepartement",
        mpoly=SQUARE,
        region=region,
    )
    epci = Epci.objects.create(
        source_id="TestEpci",
        name="TestEpci",
        mpoly=SQUARE,
    )
    commune = Commune.objects.create(
        name="TestCommune",
        insee="12345",
        mpoly=SQUARE,
        departement=dept,
        epci=epci,
    )
    return commune


@pytest.fixture
def setup_commune_pop(setup_administration_level):
    commune_pop = CommunePop(
        city=setup_administration_level,
        year=2020,
        pop=1000,
        pop_change=100,
        household=500,
        household_change=50,
    )
    commune_pop.save()
    return commune_pop


@pytest.mark.django_db
class TestCommunePop:
    def test_setup_commune_pop(self, setup_administration_level, setup_commune_pop):
        assert setup_commune_pop.city_id == setup_administration_level.id
        assert all(
            [
                setup_commune_pop.year == 2020,
                setup_commune_pop.pop == 1000,
                setup_commune_pop.pop_change == 100,
                setup_commune_pop.household == 500,
                setup_commune_pop.household_change == 50,
            ]
        )
