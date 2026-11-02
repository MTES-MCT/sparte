"""
Prépare une base vide pour les tests end-to-end (CI uniquement).

Les tables `public_data` non gérées par Django sont normalement construites par
dbt / Airflow et n'existent donc pas après `migrate`. Cette commande les crée
à partir des modèles Django (vides), puis charge la fixture d'un territoire
produite par `e2e_dump_land`.

    python manage.py e2e_setup_db

Elle refuse de s'exécuter hors d'un environnement `local` et ne touche jamais
une table déjà existante.
"""

import copy

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import connection

from public_data.management.commands.e2e_dump_land import unmanaged_public_data_models

DEFAULT_FIXTURE = "public_data/fixtures/e2e/land_COMM_69123.json"


def table_exists(table_name: str) -> bool:
    with connection.cursor() as cursor:
        cursor.execute("SELECT to_regclass(%s) IS NOT NULL", [table_name])
        return cursor.fetchone()[0]


class Command(BaseCommand):
    help = "Crée les tables non gérées (vides) et charge la fixture d'un territoire pour les tests e2e."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fixture",
            default=DEFAULT_FIXTURE,
            help=f"Fixture Django à charger (défaut : {DEFAULT_FIXTURE})",
        )

    def handle(self, *args, **options):
        if settings.ENVIRONMENT != "local":
            raise CommandError("e2e_setup_db est réservée à un environnement local (CI).")

        created = 0
        with connection.schema_editor() as schema_editor:
            for model in unmanaged_public_data_models():
                if table_exists(model._meta.db_table):
                    continue
                schema_editor.create_model(model)
                self.allow_nulls(schema_editor, model)
                created += 1
        self.stdout.write(f"{created} table(s) non gérée(s) créée(s) à partir des modèles.")

        call_command("loaddata", options["fixture"], verbosity=1)

    @staticmethod
    def allow_nulls(schema_editor, model):
        """
        Les tables dbt n'ont pas de contrainte NOT NULL alors que les modèles
        Django, eux, ne déclarent pas toujours `null=True` : on relâche la
        contrainte sur toutes les colonnes (hors clé primaire) pour que les
        données réelles se chargent telles quelles.
        """
        for field in model._meta.local_concrete_fields:
            if field.primary_key or field.null:
                continue
            nullable_field = copy.deepcopy(field)
            nullable_field.null = True
            schema_editor.alter_field(model, field, nullable_field)
