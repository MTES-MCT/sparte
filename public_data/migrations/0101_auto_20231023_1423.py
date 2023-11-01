from django.contrib.postgres.operations import TrigramExtension, UnaccentExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0100_alter_commune_epci"),
    ]

    operations = [
        UnaccentExtension(),
        TrigramExtension(),
    ]
