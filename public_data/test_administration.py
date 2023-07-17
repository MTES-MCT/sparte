import pytest
# from django.contrib.gis.geos import MultiPolygon
from django.contrib.gis.geos import GEOSGeometry

from public_data.models.administration import Departement, Region

from .models import Commune, CommunePop

# from .validators import MinValueValidator, MaxValueValidator


# SQUARE = MultiPolygon([((2.2, 4.2), (5.2, 4.2), (5.2, 6.6), (2.2, 6.6), (2.2, 4.2))], srid=4326)
# SQUARE = MultiPolygon([((2.2, 4.2), (5.2, 4.2), (5.2, 6.6), (2.2, 6.6), (2.2, 4.2))], srid='4326')
SQUARE = GEOSGeometry('MULTIPOLYGON(((2.2 4.2, 5.2 4.2, 5.2 6.6, 2.2 6.6, 2.2 4.2)))', srid=4326)


@pytest.fixture
def setup_administration_level():
    region = Region.objects.create(
        name="TestRegion",
        insee="1",
        mpoly=SQUARE,
    )
    dept = Departement.objects.create(
        name="TestDepartement",
        insee="12",
        mpoly=SQUARE,
        region=region,
    )
    commune = Commune.objects.create(
        name="TestCommune",
        insee="12345",
        mpoly=SQUARE,
        departement=dept,
    )
    return commune


@pytest.fixture
def setup_commune_pop(setup_administration_level):
    commune_pop = CommunePop(
        commune=setup_administration_level,
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
    def test_setup_commune_pop(setup_commune, setup_commune_pop):
        assert setup_commune_pop.commune_id == setup_commune.id
        assert all(
            [
                setup_commune_pop.year == 2020,
                setup_commune_pop.pop == 1000,
                setup_commune_pop.pop_change == 100,
                setup_commune_pop.household == 500,
                setup_commune_pop.household_change == 50,
            ]
        )

    # def test_commune_pop_year_validator_max():
    #     with pytest.raises(ValueError):
    #         CommunePop(year=3000)

    # def test_commune_pop_year_validator_min():
    #     with pytest.raises(ValueError):
    #         CommunePop(year=1999)

    # def test_commune_pop_pop_can_be_null():
    #     commune_pop = CommunePop(pop=None)
    #     assert commune_pop.pop is None

    # def test_commune_pop_pop_change_can_be_null():
    #     commune_pop = CommunePop(pop_change=None)
    #     assert commune_pop.pop_change is None

    # def test_commune_pop_household_can_be_null():
    #     commune_pop = CommunePop(household=None)
    #     assert commune_pop.household is None

    # def test_commune_pop_household_change_can_be_null():
    #     commune_pop = CommunePop(household_change=None)
    #     assert commune_pop.household_change is None
