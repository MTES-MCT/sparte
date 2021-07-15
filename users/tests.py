import pytest
from django.contrib.auth import get_user_model


@pytest.mark.django_db
class TestUsers:
    def test_user(self):
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
