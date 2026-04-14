import json

import pytest
from django.test import Client
from django.urls import reverse

from project.models.user_land_preference import UserLandPreference
from users.models import User


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="test@test.com",
        password="testpass123",
        first_name="Test",
        last_name="User",
        main_land_type="COMM",
        main_land_id="12345",
    )


@pytest.fixture
def client():
    return Client()


@pytest.fixture
def auth_client(client, user):
    client.login(email="test@test.com", password="testpass123")
    return client


def url(name, land_type="commune", land_id="12345"):
    return reverse(f"api:{name}", kwargs={"land_type": land_type, "land_id": land_id})


# ── UserLandPreferenceAPIView (GET) ──


class TestGetPreference:
    def test_anonymous_user(self, client):
        resp = client.get(url("user-land-preference"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_favorited"] is False
        assert data["target_2031"] is None
        assert data["comparison_lands"] == []
        assert data["is_main"] is False

    def test_authenticated_no_preference(self, auth_client):
        resp = auth_client.get(url("user-land-preference"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_favorited"] is False
        assert data["target_2031"] is None
        assert data["comparison_lands"] == []

    def test_authenticated_with_preference(self, auth_client, user):
        UserLandPreference.objects.create(user=user, land_type="COMM", land_id="12345", target_2031=50.0)
        resp = auth_client.get(url("user-land-preference"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_favorited"] is True
        assert data["target_2031"] == pytest.approx(50.0)
        assert data["is_main"] is True

    def test_is_main_false_for_different_land(self, auth_client, user):
        UserLandPreference.objects.create(user=user, land_type="DEPART", land_id="99")
        resp = auth_client.get(url("user-land-preference", land_type="departement", land_id="99"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_main"] is False


# ── UpdatePreferenceTarget2031APIView (POST) ──


class TestUpdateTarget2031:
    def test_anonymous_returns_401(self, client):
        resp = client.post(
            url("update-preference-target-2031"),
            data=json.dumps({"target_2031": 50}),
            content_type="application/json",
        )
        assert resp.status_code in (401, 403)

    def test_valid_update(self, auth_client, user):
        resp = auth_client.post(
            url("update-preference-target-2031"),
            data=json.dumps({"target_2031": 42.5}),
            content_type="application/json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["target_2031"] == pytest.approx(42.5)
        pref = UserLandPreference.objects.get(user=user, land_type="COMM", land_id="12345")
        assert float(pref.target_2031) == pytest.approx(42.5)

    def test_missing_target_2031(self, auth_client):
        resp = auth_client.post(
            url("update-preference-target-2031"),
            data=json.dumps({}),
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_out_of_range(self, auth_client):
        resp = auth_client.post(
            url("update-preference-target-2031"),
            data=json.dumps({"target_2031": 150}),
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_not_a_number(self, auth_client):
        resp = auth_client.post(
            url("update-preference-target-2031"),
            data=json.dumps({"target_2031": "abc"}),
            content_type="application/json",
        )
        assert resp.status_code == 400


# ── UpdatePreferenceComparisonLandsAPIView (POST) ──


class TestUpdateComparisonLands:
    def test_anonymous_returns_401(self, client):
        resp = client.post(
            url("update-preference-comparison-lands"),
            data=json.dumps({"comparison_lands": []}),
            content_type="application/json",
        )
        assert resp.status_code in (401, 403)

    def test_valid_update(self, auth_client, user):
        lands = [{"land_type": "COMM", "land_id": "99999", "name": "Test Commune"}]
        resp = auth_client.post(
            url("update-preference-comparison-lands"),
            data=json.dumps({"comparison_lands": lands}),
            content_type="application/json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert len(data["comparison_lands"]) == 1
        assert data["comparison_lands"][0]["land_id"] == "99999"

    def test_missing_comparison_lands(self, auth_client):
        resp = auth_client.post(
            url("update-preference-comparison-lands"),
            data=json.dumps({}),
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_not_a_list(self, auth_client):
        resp = auth_client.post(
            url("update-preference-comparison-lands"),
            data=json.dumps({"comparison_lands": "not a list"}),
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_missing_keys(self, auth_client):
        resp = auth_client.post(
            url("update-preference-comparison-lands"),
            data=json.dumps({"comparison_lands": [{"land_type": "COMM"}]}),
            content_type="application/json",
        )
        assert resp.status_code == 400


# ── ToggleFavoriteAPIView (POST) ──


class TestToggleFavorite:
    def test_anonymous_returns_401(self, client):
        resp = client.post(url("toggle-favorite"))
        assert resp.status_code in (401, 403)

    def test_add_favorite(self, auth_client, user):
        resp = auth_client.post(url("toggle-favorite"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["is_favorited"] is True
        assert UserLandPreference.objects.filter(user=user, land_type="COMM", land_id="12345").exists()

    def test_remove_favorite(self, auth_client, user):
        UserLandPreference.objects.create(user=user, land_type="COMM", land_id="12345")
        resp = auth_client.post(url("toggle-favorite"))
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["is_favorited"] is False
        assert not UserLandPreference.objects.filter(user=user, land_type="COMM", land_id="12345").exists()
