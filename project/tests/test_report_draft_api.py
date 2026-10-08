import pytest
from django.test import Client
from django.urls import reverse

from project.models import ReportDraft
from project.models.user_land_preference import UserLandPreference
from users.models import User

COMPARISON_LANDS = [{"land_type": "COMM", "land_id": "67890", "name": "Voisine"}]


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="test@test.com",
        password="testpass123",
        first_name="Test",
        last_name="User",
    )


@pytest.fixture
def draft(user):
    return ReportDraft.objects.create(
        user=user,
        report_type="rapport-complet",
        name="Mon rapport",
        land_type="COMM",
        land_id="12345",
    )


def detail_url(draft):
    return reverse("api:report-draft-detail", kwargs={"pk": draft.id})


# ── Rendu PDF anonyme : les préférences du propriétaire doivent être exposées ──


class TestOwnerPreference:
    def test_anonymous_retrieve_exposes_owner_preference(self, draft, user):
        UserLandPreference.objects.create(
            user=user,
            land_type="COMM",
            land_id="12345",
            target_2031=30.0,
            comparison_lands=COMPARISON_LANDS,
        )
        resp = Client().get(detail_url(draft))
        assert resp.status_code == 200
        pref = resp.json()["owner_preference"]
        assert pref["target_2031"] == pytest.approx(30.0)
        assert pref["comparison_lands"] == COMPARISON_LANDS

    def test_no_preference(self, draft):
        resp = Client().get(detail_url(draft))
        assert resp.status_code == 200
        assert resp.json()["owner_preference"] == {"target_2031": None, "comparison_lands": []}

    def test_ignores_other_users_preference(self, draft, db):
        other = User.objects.create_user(email="other@test.com", password="x", first_name="O", last_name="U")
        UserLandPreference.objects.create(user=other, land_type="COMM", land_id="12345", target_2031=10.0)
        resp = Client().get(detail_url(draft))
        assert resp.json()["owner_preference"]["target_2031"] is None

    def test_ignores_preference_of_other_land(self, draft, user):
        UserLandPreference.objects.create(user=user, land_type="COMM", land_id="99999", target_2031=10.0)
        resp = Client().get(detail_url(draft))
        assert resp.json()["owner_preference"]["target_2031"] is None
