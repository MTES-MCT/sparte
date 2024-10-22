import sys

from django.db import connection
from django.db.backends.base.schema import BaseDatabaseSchemaEditor

from public_data.models import (
    ArtifAreaZoneUrba,
    ArtificialArea,
    Commune,
    CommuneDiff,
    CommunePop,
    CommuneSol,
    Departement,
    Epci,
    Region,
    Scot,
    ZoneUrba,
)


class NotInTestEnvironmentError(Exception):
    pass


def drop_and_create_model(model, schema_editor: BaseDatabaseSchemaEditor) -> None:
    sql = f"DROP TABLE IF EXISTS {model._meta.db_table} CASCADE;"
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
    if sys.argv[1:2] != ["test"]:
        raise NotInTestEnvironmentError("Cette fonction ne doit être appelée que dans le cadre de tests unitaires")

    with connection.schema_editor() as schema_editor:
        drop_and_create_model(Commune, schema_editor)
        drop_and_create_model(Region, schema_editor)
        drop_and_create_model(Departement, schema_editor)
        drop_and_create_model(Epci, schema_editor)
        drop_and_create_model(Scot, schema_editor)
        drop_and_create_model(CommuneDiff, schema_editor)
        drop_and_create_model(CommunePop, schema_editor)
        drop_and_create_model(CommuneSol, schema_editor)
        drop_and_create_model(ArtifAreaZoneUrba, schema_editor)
        drop_and_create_model(ZoneUrba, schema_editor)
        drop_and_create_model(ArtificialArea, schema_editor)
