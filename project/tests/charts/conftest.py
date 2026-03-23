import pytest

from public_data.models import LandModel
from utils.schema import init_unmanaged_schema_for_tests


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    """Load unmanaged schema and test fixtures once for all chart tests."""
    with django_db_blocker.unblock():
        init_unmanaged_schema_for_tests()
        from django.core.management import call_command

        call_command("loaddata", "public_data/fixtures/test_data.json.gz", verbosity=0)


@pytest.fixture()
def metropole_de_lyon(db):
    return LandModel.objects.get(land_type="EPCI", land_id="200046977")
