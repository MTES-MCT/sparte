from pathlib import Path

from public_data.domain.shapefile_builder.BaseShapefileBuilder import (
    BaseShapefileBuilder,
)
from public_data.models import DataSource

from .build_consommation_espace import build_consommation_espace
from .build_ocsge_difference import build_ocsge_difference
from .build_ocsge_occupation_du_sol import build_ocsge_occupation_du_sol
from .build_ocsge_zone_artificielle import build_ocsge_zone_artificielle
from .build_ocsge_zone_construite import build_ocsge_zone_construite


class GdalShapefileBuilder(BaseShapefileBuilder):
    def build_ocsge_difference(self, source: DataSource) -> tuple[DataSource, Path]:
        return build_ocsge_difference(source)

    def build_ocsge_zone_construite(self, source: DataSource) -> tuple[DataSource, Path]:
        return build_ocsge_zone_construite(source)

    def build_ocsge_occupation_du_sol(self, source: DataSource) -> tuple[DataSource, Path]:
        return build_ocsge_occupation_du_sol(source)

    def build_consommation_espace(self, source: DataSource) -> tuple[DataSource, Path]:
        return build_consommation_espace(source)

    def build_ocsge_zone_artificielle(self, source: DataSource) -> tuple[DataSource, Path]:
        return build_ocsge_zone_artificielle(source)
