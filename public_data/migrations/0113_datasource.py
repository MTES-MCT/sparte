# Generated by Django 4.2.7 on 2024-01-18 12:47

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0112_rename_ocsge_millesimes_departement_ocsge_millesimes_old"),
    ]

    operations = [
        migrations.CreateModel(
            name="DataSource",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "productor",
                    models.CharField(
                        choices=[("IGN", "Institut national de l'information géographique et forestière")],
                        max_length=255,
                        verbose_name="Producteur",
                    ),
                ),
                (
                    "dataset",
                    models.CharField(
                        choices=[("OCSGE", "Occupation du sol à grande échelle")],
                        max_length=255,
                        verbose_name="Jeu de donnée",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        choices=[
                            ("OCCUPATION_DU_SOL", "Couverture et usage du sol"),
                            ("DIFFERENCE", "Différence entre deux OCSGE"),
                            ("ZONE_CONSTRUITE", "Zone construite"),
                        ],
                        help_text="Nom de la couche de données aun sein du jeu de donnée",
                        max_length=255,
                        verbose_name="Nom",
                    ),
                ),
                (
                    "millesimes",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.IntegerField(), blank=True, null=True, size=None, verbose_name="Année(s)"
                    ),
                ),
                ("mapping", models.JSONField(blank=True, null=True)),
                ("path", models.CharField(max_length=255, verbose_name="Chemin sur S3")),
                ("source_url", models.URLField(blank=True, null=True, verbose_name="URL de la source")),
                (
                    "official_land_id",
                    models.CharField(
                        help_text="ID officiel du territoire (code INSEE, SIREN, etc.)",
                        max_length=255,
                        verbose_name="ID du territoire",
                    ),
                ),
            ],
            options={
                "unique_together": {("productor", "dataset", "name", "millesimes", "official_land_id")},
            },
        ),
    ]
