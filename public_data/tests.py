import pytest

from . import models


@pytest.mark.django_db
class TestCerema:
    def test_get_art_fields(self):
        fields = models.Cerema.get_art_field(2015, 2018)
        assert fields == [
            "naf15art16",
            "naf16art17",
            "naf17art18",
            "naf18art19",
        ]
        fields = models.Cerema.get_art_field(2014, 2014)
        assert fields == ["naf14art15"]
        fields = models.Cerema.get_art_field(2010, 2020)
        assert len(fields) == 11
        with pytest.raises(ValueError):
            models.Cerema.get_art_field(2008, 2020)
        with pytest.raises(ValueError):
            models.Cerema.get_art_field(2010, 2022)
        with pytest.raises(ValueError):
            models.Cerema.get_art_field(2019, 2009)
