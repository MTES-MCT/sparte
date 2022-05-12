# Generated by Django 3.2.13 on 2022-05-12 12:11

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("public_data", "0057_auto_20220512_0947"),
    ]

    operations = [
        migrations.CreateModel(
            name="CommuneSol",
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
                    "year",
                    models.IntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(2000),
                            django.core.validators.MaxValueValidator(2050),
                        ],
                        verbose_name="Millésime",
                    ),
                ),
                (
                    "surface_artif",
                    models.DecimalField(
                        blank=True,
                        decimal_places=4,
                        max_digits=15,
                        null=True,
                        verbose_name="Surface",
                    ),
                ),
                (
                    "city",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="public_data.commune",
                        verbose_name="Commune",
                    ),
                ),
                (
                    "matrix",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="public_data.couvertureusagematrix",
                    ),
                ),
            ],
        ),
    ]
