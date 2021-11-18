import pytest
import re

from django.contrib.gis.geos import Polygon, MultiPolygon

from users.tests import users  # noqa: F401

from .models import Project, Emprise, user_directory_path


BIG_SQUARE = MultiPolygon(
    [Polygon.from_bbox((43, -1, 44, 0))],
    srid=4326,
)

INNER_SQUARE = MultiPolygon(
    [Polygon.from_bbox((43.25, -0.75, 43.75, -0.25))],
    srid=4326,
)

SMALL_SQUARE = MultiPolygon(
    [Polygon.from_bbox((43.4, -0.6, 43.6, -0.4))],
    srid=4326,
)


@pytest.fixture
def projects(db, users):  # noqa: F811
    cobas = Project.objects.create(
        user=users["normal"],
        name="COBAS",
        description="Awesome description",
        analyse_start_date=2009,
        analyse_end_date=2018,
    )
    cobas.emprise_set.create(mpoly=BIG_SQUARE)
    projects = {
        "cobas": cobas,
    }
    return projects


@pytest.mark.django_db
class TestProject:
    def test_fixture(self, projects):
        assert Project.objects.count() == 1
        assert Emprise.objects.count() == 1

    def test_create(self, users):  # noqa: F811
        project = Project.objects.create(
            user=users["normal"],
            name="COBAS",
            description="Awesome description",
            analyse_start_date=2009,
            analyse_end_date=2018,
        )
        assert project.id is not None
        assert project.import_status == Project.Status.MISSING
        assert project.import_error is None
        assert project.import_date is None

    def test_area(self, projects):
        project = Project.objects.get(name="COBAS")
        expected_area = BIG_SQUARE.transform(2154, clone=True).area / 1000 ** 2
        assert project.area == expected_area

    def test_set_success(self, projects):
        project = Project.objects.get(name="COBAS")
        project.set_success()
        project_2 = Project.objects.get(name="COBAS")
        assert project_2.import_status == Project.Status.SUCCESS
        assert project.import_date is not None
        assert project.import_error is None

    def test_set_failed(self, projects):
        project = Project.objects.get(name="COBAS")
        project.set_failed(trace="error description")
        project_2 = Project.objects.get(name="COBAS")
        assert project_2.import_status == Project.Status.FAILED
        assert project.import_date is not None
        assert project.import_error == "error description"

    def test_reset(self, projects):
        project = Project.objects.get(name="COBAS")
        project.set_failed(trace="error description")
        project.reset(save=True)
        assert project.emprise_set.count() == 0
        assert project.import_status == Project.Status.MISSING
        assert project.import_error is None
        assert project.import_date is None


class TestModelUtils:
    def test_user_directory_path(self, projects):
        filename = "file.txt"
        path_re = re.compile(r"(user_[0-9]{4,4}\/)?[\w]{6,6}\/(.+)")
        assert path_re.match(user_directory_path(projects["cobas"], filename))
        assert path_re.match(user_directory_path(None, filename))
