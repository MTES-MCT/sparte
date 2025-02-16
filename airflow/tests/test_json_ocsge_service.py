import pytest
from include.domain.container import Container
from include.domain.data.ocsge.BaseOcsgeSourceService import BaseOcsgeSourceService
from include.domain.data.ocsge.enums import SourceName


@pytest.fixture
def ocsge_source_service() -> BaseOcsgeSourceService:
    container = Container()
    return container.ocsge_source_service()


def test_json_ocsge_service_returns_diff_properly(ocsge_source_service: BaseOcsgeSourceService):
    source = ocsge_source_service.get(
        years=[2018, 2021],
        departement="75",
        type=SourceName.DIFFERENCE,
    )

    assert (
        source.url
        == "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D075_DIFF_2018-2021/OCS-GE_2-0__SHP_LAMB93_D075_DIFF_2018-2021.7z"  # noqa
    )
    assert source.years == [2018, 2021]
    assert source.departement == "75"
    assert source.type == SourceName.DIFFERENCE


def test_json_ocsge_service_raises_error_when_years_are_not_two(ocsge_source_service: BaseOcsgeSourceService):
    try:
        ocsge_source_service.get(
            years=[2018],
            departement="75",
            type=SourceName.DIFFERENCE,
        )
    except ValueError as e:
        error = e

    assert str(error) == "La source de type DIFFERENCE ne peut être appelée qu'avec deux années"


def test_json_ocsge_service_returns_occupation_du_sol_properly(ocsge_source_service: BaseOcsgeSourceService):
    source = ocsge_source_service.get(
        years=[2021],
        departement="75",
        type=SourceName.OCCUPATION_DU_SOL,
    )

    assert (
        source.url
        == "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D075_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D075_2021-01-01.7z"  # noqa
    )
    assert source.years == [2021]
    assert source.departement == "75"
    assert source.type == SourceName.OCCUPATION_DU_SOL


def test_json_ocsge_service_raises_error_when_years_are_not_one(ocsge_source_service: BaseOcsgeSourceService):
    try:
        ocsge_source_service.get(
            years=[2018, 2021],
            departement="75",
            type=SourceName.OCCUPATION_DU_SOL,
        )
    except ValueError as e:
        error = e

    assert (
        str(error)
        == "La source de type OCCUPATION_DU_SOL ou ZONE_CONSTRUITE ne peut être appelée qu'avec une année"  # noqa
    )


def test_json_ocsge_service_returns_zone_construite_properly(ocsge_source_service: BaseOcsgeSourceService):
    source = ocsge_source_service.get(
        years=[2021],
        departement="75",
        type=SourceName.ZONE_CONSTRUITE,
    )

    assert (
        source.url
        == "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D075_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D075_2021-01-01.7z"  # noqa
    )
    assert source.years == [2021]
    assert source.departement == "75"
    assert source.type == SourceName.ZONE_CONSTRUITE


def test_json_ocsge_service_raises_error_when_unknown_type(ocsge_source_service: BaseOcsgeSourceService):
    try:
        ocsge_source_service.get(
            years=[2021],
            departement="75",
            type="unknown",
        )
    except ValueError as e:
        error = e

    assert str(error).startswith("Type de source inconnu") is True


def test_json_ocsge_service_raises_error_when_missing_departement(ocsge_source_service: BaseOcsgeSourceService):
    try:
        ocsge_source_service.get(
            years=[2021],
            departement="unknown",
            type=SourceName.ZONE_CONSTRUITE,
        )
    except ValueError as e:
        error = e

    assert str(error) == "Le département unknown n'existe pas dans les sources OCSGE"


def test_missing_year_for_zone_construite_raises_error(ocsge_source_service: BaseOcsgeSourceService):
    try:
        ocsge_source_service.get(
            years=[2020],
            departement="75",
            type=SourceName.ZONE_CONSTRUITE,
        )
    except ValueError as e:
        error = e

    assert str(error) == "L'année(s) 2020 n'existe(nt) pas dans les sources OCSGE pour le département 75"


def test_missing_year_for_occupation_du_sol_raises_error(ocsge_source_service: BaseOcsgeSourceService):
    try:
        ocsge_source_service.get(
            years=[2020],
            departement="75",
            type=SourceName.OCCUPATION_DU_SOL,
        )
    except ValueError as e:
        error = e

    assert str(error) == "L'année(s) 2020 n'existe(nt) pas dans les sources OCSGE pour le département 75"


def test_missing_year_for_difference_raises_error(ocsge_source_service: BaseOcsgeSourceService):
    try:
        ocsge_source_service.get(
            years=[2020, 2021],
            departement="75",
            type=SourceName.DIFFERENCE,
        )
    except ValueError as e:
        error = e

    assert str(error) == "L'année(s) 2020_2021 n'existe(nt) pas dans les sources OCSGE pour le département 75"
