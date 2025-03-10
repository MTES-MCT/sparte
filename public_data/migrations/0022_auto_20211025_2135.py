# Generated by Django 3.2.5 on 2021-10-25 21:35

import django.contrib.gis.db.models.fields
import django.core.validators
from django.db import migrations, models

import public_data.models.mixins


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0021_voirie2018_usage_label"),
    ]

    operations = [
        migrations.CreateModel(
            name="Ocsge",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "couverture",
                    models.CharField(
                        blank=True,
                        max_length=254,
                        null=True,
                        verbose_name="Couverture du sol",
                    ),
                ),
                (
                    "usage",
                    models.CharField(
                        blank=True,
                        max_length=254,
                        null=True,
                        verbose_name="Usage du sol",
                    ),
                ),
                (
                    "millesime",
                    models.DateField(blank=True, null=True, verbose_name="Millésime"),
                ),
                (
                    "source",
                    models.CharField(blank=True, max_length=254, null=True, verbose_name="Source"),
                ),
                (
                    "origine",
                    models.CharField(blank=True, max_length=254, null=True, verbose_name="Origine"),
                ),
                (
                    "origine2",
                    models.CharField(blank=True, max_length=254, null=True, verbose_name="Origine1"),
                ),
                (
                    "ossature",
                    models.IntegerField(blank=True, null=True, verbose_name="Ossature"),
                ),
                (
                    "commentaire",
                    models.CharField(
                        blank=True,
                        max_length=254,
                        null=True,
                        verbose_name="Commentaire",
                    ),
                ),
                (
                    "year",
                    models.IntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(2000),
                            django.core.validators.MaxValueValidator(2050),
                        ],
                        verbose_name="Année",
                    ),
                ),
                (
                    "couverture_label",
                    models.CharField(
                        blank=True,
                        max_length=254,
                        null=True,
                        verbose_name="Libellé couverture du sol",
                    ),
                ),
                (
                    "usage_label",
                    models.CharField(
                        blank=True,
                        max_length=254,
                        null=True,
                        verbose_name="Libellé usage du sol",
                    ),
                ),
                (
                    "map_color",
                    models.CharField(blank=True, max_length=8, null=True, verbose_name="Couleur"),
                ),
                (
                    "mpoly",
                    django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326),
                ),
            ],
            bases=(
                models.Model,
                public_data.models.mixins.DataColorationMixin,
            ),
        ),
        migrations.DeleteModel(
            name="Ocsge2015",
        ),
        migrations.DeleteModel(
            name="Ocsge2018",
        ),
        migrations.AddIndex(
            model_name="ocsge",
            index=models.Index(fields=["couverture"], name="public_data_couvert_aadf19_idx"),
        ),
        migrations.AddIndex(
            model_name="ocsge",
            index=models.Index(fields=["usage"], name="public_data_usage_9eda31_idx"),
        ),
        migrations.CreateModel(
            name="Ocsge2015",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
            },
            bases=("public_data.ocsge",),
        ),
        migrations.CreateModel(
            name="Ocsge2018",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
            },
            bases=("public_data.ocsge",),
        ),
    ]
