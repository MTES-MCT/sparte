# Migration to create public_data_land table if it doesn't exist (for tests)

from django.db import migrations, models


def create_land_table_if_not_exists(apps, schema_editor):
    """Create the LandModel table if it doesn't exist (for tests)."""
    LandModel = apps.get_model("public_data", "LandModel")

    # Check if table exists
    table_name = LandModel._meta.db_table
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s)", [table_name])
        exists = cursor.fetchone()[0]

    if not exists:
        schema_editor.create_model(LandModel)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0202_delete_similarterritories"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="landmodel",
                    name="key",
                    field=models.TextField(unique=True),
                ),
            ],
            database_operations=[],
        ),
        migrations.RunPython(create_land_table_if_not_exists, noop),
    ]
