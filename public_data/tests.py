from decimal import Decimal
import pytest

from . import models


@pytest.fixture
def artif_communes(db):
    communes = [
        models.ArtifCommune.objects.create(
            name="simple creation",
            insee="123456",
            surface=100,
            artif_before_2009=0.001,
            artif_2009=0.01,
            artif_2010=0.1,
            artif_2011=1,
            artif_2012=2,
            artif_2013=3,
            artif_2014=4,
            artif_2015=5,
            artif_2016=6,
            artif_2017=7,
            artif_2018=8,
        ),
    ]
    return communes


@pytest.mark.django_db
class TestArtifCommune:
    """Tests classiques CRUD"""

    def test_minimal_create(self):
        commune = models.ArtifCommune.objects.create(
            name="simple creation",
            insee="123456",
            surface=123.567,
            artif_before_2009=0.1,
            artif_2009=0.01,
            artif_2010=0.001,
            artif_2011=1,
            artif_2012=2,
            artif_2013=3,
            artif_2014=4,
            artif_2015=5,
            artif_2016=6,
            artif_2017=7,
            artif_2018=8,
        )
        assert models.ArtifCommune.objects.count() == 1
        assert str(commune) == "simple creation - 123456"

    def test_cls_list_attr(self):
        expected = [
            "artif_before_2009",
            "artif_2009",
            "artif_2010",
            "artif_2011",
            "artif_2012",
            "artif_2013",
            "artif_2014",
            "artif_2015",
            "artif_2016",
            "artif_2017",
            "artif_2018",
        ]
        for value in models.ArtifCommune.list_attr():
            # value is in expected value
            assert value in expected
            expected.pop(expected.index(value))
        # all expected values have been poped
        assert len(expected) == 0

    def test_list_attr(self, artif_communes):
        commune = models.ArtifCommune.objects.get(name="simple creation")
        expected_dict = {
            "artif_before_2009": Decimal(0),
            "artif_2009": Decimal("0.01"),
            "artif_2010": Decimal("0.1"),
            "artif_2011": Decimal(1),
            "artif_2012": Decimal(2),
            "artif_2013": Decimal(3),
            "artif_2014": Decimal(4),
            "artif_2015": Decimal(5),
            "artif_2016": Decimal(6),
            "artif_2017": Decimal(7),
            "artif_2018": Decimal(8),
        }
        expected_flat = list(expected_dict.values())
        for value in commune.list_artif():
            assert value in expected_flat
            expected_flat.pop(expected_flat.index(value))
        assert len(expected_flat) == 0
        assert commune.list_artif(flat=False) == expected_dict

    def test_total_artif(self, artif_communes):
        commune = models.ArtifCommune.objects.get(name="simple creation")
        assert commune.total_artif() == Decimal("36.11")

    def test_total_percent(self, artif_communes):
        commune = models.ArtifCommune.objects.get(name="simple creation")
        assert commune.total_percent() == round(Decimal(36.11 / 100), 4)

    def test_percent(self, artif_communes):
        commune = models.ArtifCommune.objects.get(name="simple creation")
        assert commune.percent("artif_before_2009") == 0
        assert commune.percent("artif_2013") == round(Decimal(3 / 100), 2)

    def test_list_percent(self, artif_communes):
        commune = models.ArtifCommune.objects.get(name="simple creation")
        expected = [0, 0.01, 0.1] + list(range(1, 9))
        expected = list(map(lambda x: round(Decimal(x / 100), 4), expected))
        assert commune.list_percent() == expected
