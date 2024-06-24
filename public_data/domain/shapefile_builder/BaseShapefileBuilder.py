from abc import ABC, abstractmethod
from pathlib import Path

from public_data.models import DataSource


class BaseShapefileBuilder(ABC):
    def build(self, source: DataSource) -> list[tuple[DataSource, Path]]:
        """
        Builds a shapefile from a DataSource.
        """
        created = []

        if source.productor == source.ProductorChoices.IGN:
            if source.dataset == source.DatasetChoices.OCSGE:
                if source.name == source.DataNameChoices.DIFFERENCE:
                    created.append(self.build_ocsge_difference(source))
                elif source.name == source.DataNameChoices.ZONE_CONSTRUITE:
                    created.append(self.build_ocsge_zone_construite(source))
                elif source.name == source.DataNameChoices.OCCUPATION_DU_SOL:
                    created.append(self.build_ocsge_occupation_du_sol(source))
                    created.append(self.build_ocsge_zone_artificielle(source))
                elif source.name == source.DataNameChoices.ZONE_ARTIFICIELLE:
                    created.append(self.build_ocsge_zone_artificielle(source))
        elif source.productor == source.ProductorChoices.CEREMA:
            if source.dataset == source.DatasetChoices.MAJIC:
                created.append(self.build_consommation_espace(source))

        if not created:
            raise NotImplementedError(f"Building {source} is not implemented")

        return created

    @abstractmethod
    def build_ocsge_zone_artificielle(self, source: DataSource) -> tuple[DataSource, Path]:
        pass

    @abstractmethod
    def build_ocsge_difference(self, source: DataSource) -> tuple[DataSource, Path]:
        """
        Creates a new shapefile with the difference between two OCSGE.
        Based on the diff shapefile from IGN.

        Output fields:
        - YEAR_OLD: Year of the old OCSGE
        - YEAR_NEW: Year of the new OCSGE
        - CS_NEW: Code of the new coverage
        - CS_OLD: Code of the old coverage
        - US_NEW: Code of the new usage
        - US_OLD: Code of the old usage
        - SRID: SRID of the shapefile
        - SURFACE: Surface of the polygon in square meters
        - DPT: Departement code
        - GEOMETRY: Geometry of the polygon
        - NEW_ARTIF: 1 if the new coverage is artificial and the old one is not
        - NEW_NAT: 1 if the new coverage is natural and the old one is not
        """

    @abstractmethod
    def build_ocsge_zone_construite(self, source: DataSource) -> tuple[DataSource, Path]:
        """
        Creates a new shapefile with the zone construite from OCSGE.
        Based on the zone construite shapefile from IGN.

        Expected output fields:
        - ID: ID of the polygon. TODO: remove this field as it is not used
        - YEAR: Year of the OCSGE
        - MILLESIME: Millesime of the OCSGE. This field is duplicated with YEAR. TODO: remove this field
        - SRID: SRID of the shapefile
        - DPT: Departement code
        - SURFACE: Surface of the polygon in square meters
        - MPOLY: Geometry of the polygon
        """

    @abstractmethod
    def build_ocsge_occupation_du_sol(self, source: DataSource) -> tuple[DataSource, Path]:
        """
        Creates a new shapefile with the occupation du sol from OCSGE.
        Based on the occupation du sol shapefile from IGN.

        Output fields:
        - CODE_CS: Code of the coverage
        - CODE_US: Code of the usage
        - ID: ID of the polygon.
        - GEOMETRY: Geometry of the polygon TODO: renamme MPOLY
        - SURFACE: Surface of the polygon in square meters
        - DPT: Departement code
        - YEAR: Year of the OCSGE
        - SRID: SRID of the shapefile
        - IS_ARTIF: 1 if the coverage is artificial
        """

    @abstractmethod
    def build_consommation_espace(self, source: DataSource) -> tuple[DataSource, Path]:
        """
        Creates a new shapefile with the consommation d'espace from MAJIC.
        Based on the consommation d'espace shapefile from CEREMA.
        """
