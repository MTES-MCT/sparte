# Generated by Django 4.2.9 on 2024-04-09 14:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0154_alter_datasource_name"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="ocsge",
            index=models.Index(fields=["departement"], name="public_data_departe_688545_idx"),
        ),
    ]