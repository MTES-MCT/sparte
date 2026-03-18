import sys

from django.db import connection
from django.db.backends.base.schema import BaseDatabaseSchemaEditor

from public_data.models import (
    ArtifZonage,
    ArtifZonageIndex,
    AutorisationLogement,
    ImperZonage,
    ImperZonageIndex,
    LandArtifFlux,
    LandArtifFluxCouvertureComposition,
    LandArtifFluxCouvertureCompositionIndex,
    LandArtifFluxIndex,
    LandArtifFluxUsageComposition,
    LandArtifFluxUsageCompositionIndex,
    LandArtifStock,
    LandArtifStockCouvertureComposition,
    LandArtifStockCouvertureCompositionIndex,
    LandArtifStockIndex,
    LandArtifStockUsageComposition,
    LandArtifStockUsageCompositionIndex,
    LandConso,
    LandConsoComparison,
    LandConsoStats,
    LandFriche,
    LandFricheGeojson,
    LandFrichePollution,
    LandFricheStatut,
    LandFricheSurfaceRank,
    LandFricheType,
    LandFricheZonageEnvironnementale,
    LandFricheZonageType,
    LandFricheZoneActivite,
    LandImperFlux,
    LandImperFluxCouvertureComposition,
    LandImperFluxCouvertureCompositionIndex,
    LandImperFluxIndex,
    LandImperFluxUsageComposition,
    LandImperFluxUsageCompositionIndex,
    LandImperStock,
    LandImperStockCouvertureComposition,
    LandImperStockCouvertureCompositionIndex,
    LandImperStockIndex,
    LandImperStockUsageComposition,
    LandImperStockUsageCompositionIndex,
    LandModel,
    LandPop,
    LandPopStats,
    LogementVacant,
    NearestTerritories,
)
from public_data.models.administration.LandGeoJSON import LandGeoJSON
from public_data.models.bivariate import (
    BivariateConsoThreshold,
    BivariateIndicThreshold,
    BivariateLandRate,
)
from public_data.models.dossier_complet import (
    LandDcActiviteChomage,
    LandDcCategoriesSocioprofessionnelles,
    LandDcCreationsEntreprises,
    LandDcEquipementsBpe,
    LandDcLogement,
    LandDcMenages,
    LandDcPopulation,
    LandDcRevenusPauvrete,
    LandDcTourisme,
)


class NotInTestEnvironmentError(Exception):
    pass


def drop_and_create_model(model, schema_editor: BaseDatabaseSchemaEditor) -> None:
    table = model._meta.db_table
    sql = f"DROP TABLE IF EXISTS {table} CASCADE;"
    for field in model._meta.local_many_to_many:
        sql += f"DROP TABLE IF EXISTS {field.remote_field.through._meta.db_table} CASCADE;"
    schema_editor.execute(sql)
    schema_editor.create_model(model)


def init_unmanaged_schema_for_tests() -> None:
    """
    Comme les tables non managées sont crées à partir d'airflow,
    elles doivent être créees à la main pour les tests.

    On doit également d'abord les supprimer pour éviter que
    d'anciens fichiers de migrations ne soient utilisés
    (de la période où les tables étaient managées par Django)
    """
    # Check if we're in a test environment (Django test or pytest)
    is_django_test = sys.argv[1:2] == ["test"]
    is_pytest = "pytest" in sys.argv[0] or any("pytest" in arg for arg in sys.argv)

    if not (is_django_test or is_pytest):
        raise NotInTestEnvironmentError("Cette fonction ne doit être appelée que dans le cadre de tests unitaires")

    with connection.schema_editor() as schema_editor:
        # Administration
        drop_and_create_model(LandModel, schema_editor)
        drop_and_create_model(LandGeoJSON, schema_editor)

        # Consommation
        drop_and_create_model(LandConso, schema_editor)
        drop_and_create_model(LandConsoComparison, schema_editor)
        drop_and_create_model(LandConsoStats, schema_editor)

        # Demography
        drop_and_create_model(LandPop, schema_editor)
        drop_and_create_model(LandPopStats, schema_editor)
        drop_and_create_model(NearestTerritories, schema_editor)

        # Artificialisation - Stock
        drop_and_create_model(ArtifZonage, schema_editor)
        drop_and_create_model(ArtifZonageIndex, schema_editor)
        drop_and_create_model(LandArtifStock, schema_editor)
        drop_and_create_model(LandArtifStockIndex, schema_editor)
        drop_and_create_model(LandArtifStockCouvertureComposition, schema_editor)
        drop_and_create_model(LandArtifStockCouvertureCompositionIndex, schema_editor)
        drop_and_create_model(LandArtifStockUsageComposition, schema_editor)
        drop_and_create_model(LandArtifStockUsageCompositionIndex, schema_editor)

        # Artificialisation - Flux
        drop_and_create_model(LandArtifFlux, schema_editor)
        drop_and_create_model(LandArtifFluxIndex, schema_editor)
        drop_and_create_model(LandArtifFluxCouvertureComposition, schema_editor)
        drop_and_create_model(LandArtifFluxCouvertureCompositionIndex, schema_editor)
        drop_and_create_model(LandArtifFluxUsageComposition, schema_editor)
        drop_and_create_model(LandArtifFluxUsageCompositionIndex, schema_editor)

        # Imperméabilisation - Stock
        drop_and_create_model(ImperZonage, schema_editor)
        drop_and_create_model(ImperZonageIndex, schema_editor)
        drop_and_create_model(LandImperStock, schema_editor)
        drop_and_create_model(LandImperStockIndex, schema_editor)
        drop_and_create_model(LandImperStockCouvertureComposition, schema_editor)
        drop_and_create_model(LandImperStockCouvertureCompositionIndex, schema_editor)
        drop_and_create_model(LandImperStockUsageComposition, schema_editor)
        drop_and_create_model(LandImperStockUsageCompositionIndex, schema_editor)

        # Imperméabilisation - Flux
        drop_and_create_model(LandImperFlux, schema_editor)
        drop_and_create_model(LandImperFluxIndex, schema_editor)
        drop_and_create_model(LandImperFluxCouvertureComposition, schema_editor)
        drop_and_create_model(LandImperFluxCouvertureCompositionIndex, schema_editor)
        drop_and_create_model(LandImperFluxUsageComposition, schema_editor)
        drop_and_create_model(LandImperFluxUsageCompositionIndex, schema_editor)

        # Urbanisme - Friches
        drop_and_create_model(LandFriche, schema_editor)
        drop_and_create_model(LandFricheGeojson, schema_editor)
        drop_and_create_model(LandFrichePollution, schema_editor)
        drop_and_create_model(LandFricheStatut, schema_editor)
        drop_and_create_model(LandFricheSurfaceRank, schema_editor)
        drop_and_create_model(LandFricheType, schema_editor)
        drop_and_create_model(LandFricheZonageEnvironnementale, schema_editor)
        drop_and_create_model(LandFricheZonageType, schema_editor)
        drop_and_create_model(LandFricheZoneActivite, schema_editor)

        # Urbanisme - Autres
        drop_and_create_model(AutorisationLogement, schema_editor)
        drop_and_create_model(LogementVacant, schema_editor)

        # Dossier Complet
        drop_and_create_model(LandDcPopulation, schema_editor)
        drop_and_create_model(LandDcLogement, schema_editor)
        drop_and_create_model(LandDcMenages, schema_editor)
        drop_and_create_model(LandDcActiviteChomage, schema_editor)
        drop_and_create_model(LandDcCreationsEntreprises, schema_editor)
        drop_and_create_model(LandDcCategoriesSocioprofessionnelles, schema_editor)
        drop_and_create_model(LandDcEquipementsBpe, schema_editor)
        drop_and_create_model(LandDcRevenusPauvrete, schema_editor)
        drop_and_create_model(LandDcTourisme, schema_editor)

        # Bivariate
        drop_and_create_model(BivariateLandRate, schema_editor)
        drop_and_create_model(BivariateConsoThreshold, schema_editor)
        drop_and_create_model(BivariateIndicThreshold, schema_editor)
