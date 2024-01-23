# Generated by Django 4.2.7 on 2024-01-23 16:10

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0115_alter_datasource_options_datasource_srid_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="datasource",
            name="millesimes",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.IntegerField(),
                blank=True,
                help_text="Séparer les années par une virgule si la donnée concerne plusieurs années",
                null=True,
                size=None,
                verbose_name="Millésime(s)",
            ),
        ),
    ]
