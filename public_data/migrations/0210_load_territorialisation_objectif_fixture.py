from django.core.management import call_command
from django.db import migrations


def load_fixture(apps, schema_editor):
    call_command("loaddata", "territorialisation_objectif", app_label="public_data")


def unload_fixture(apps, schema_editor):
    TerritorialisationObjectif = apps.get_model("public_data", "TerritorialisationObjectif")
    TerritorialisationObjectif.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0209_alter_document_comment_default"),
    ]

    operations = [
        migrations.RunPython(load_fixture, unload_fixture),
    ]
