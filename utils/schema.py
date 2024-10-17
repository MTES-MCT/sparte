import sys

from django.db import connection

from public_data.models import Commune, Departement, Epci, Region, Scot


class NotInTestEnvironmentError(Exception):
    pass


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
        schema_editor.delete_model(Commune)
        schema_editor.create_model(Commune)
        schema_editor.delete_model(Region)
        schema_editor.create_model(Region)
        schema_editor.delete_model(Departement)
        schema_editor.create_model(Departement)
        schema_editor.delete_model(Epci)
        schema_editor.create_model(Epci)
        schema_editor.delete_model(Scot)
        schema_editor.create_model(Scot)
