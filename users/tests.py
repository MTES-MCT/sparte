import pytest

from django.contrib.auth import get_user_model
from django.utils import timezone


@pytest.fixture
def users(db):
    User = get_user_model()
    users = {
        "normal": User.objects.create_user(
            email="normal@user.com",
            password="foo",
            first_name="Henry",
            last_name="Duflaut",
            email_checked=timezone.now(),
            organism="EPF",
            function="président du monde",
        ),
        "staff": User.objects.create_user(
            email="staff@user.com",
            password="foo",
            first_name="Juliette",
            last_name="Binoche",
            is_staff=True,
        ),
        "super": User.objects.create_superuser(
            email="super@user.com",
            password="foo",
            first_name="admin",
            last_name="ADMIN",
        ),
    }
    return users


@pytest.mark.django_db
class TestUsers:
    def test_create_user(self):
        User = get_user_model()
        user = User.objects.create_user(email="normal@user.com", password="foo")
        assert user.email == "normal@user.com"
        assert str(user) == "normal@user.com"
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser
        # username is None
        assert user.username is None
        with pytest.raises(TypeError):
            User.objects.create_user()
        with pytest.raises(TypeError):
            User.objects.create_user(email="")
        with pytest.raises(ValueError):
            User.objects.create_user(email="", password="foo")

    def test_all_fields(self):
        User = get_user_model()
        user = User.objects.create_user(
            email="normal@user.com",
            password="foo",
            first_name="Henry",
            last_name="Duflaut",
            email_checked=timezone.now(),
            organism="EPF",
            function="président du monde",
        )
        assert user.id is not None

    def test_superuser(self):
        User = get_user_model()
        user = User.objects.create_superuser(email="normal@user.com", password="foo")
        assert user.is_active
        assert user.is_staff
        assert user.is_superuser
        with pytest.raises(TypeError):
            User.objects.create_superuser()
        with pytest.raises(TypeError):
            User.objects.create_superuser(email="")
        with pytest.raises(ValueError):
            User.objects.create_superuser(email="", password="foo")

    def test_greetings(self):
        User = get_user_model()
        user = User(email="normal@user.com", password="foo")
        assert user.greetings == "normal@user.com"
        user.first_name = "first name"
        assert user.greetings == "first name"

    def test_str(self):
        User = get_user_model()
        user = User(email="normal@user.com", password="foo")
        assert str(user) == "normal@user.com"

    def test_fixtures(self, users):
        User = get_user_model()
        assert User.objects.count() == 3
