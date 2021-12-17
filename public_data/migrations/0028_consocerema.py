# Generated by Django 3.2.5 on 2021-12-16 20:53

import django.contrib.gis.db.models.fields
from django.db import migrations, models
import public_data.behaviors


class Migration(migrations.Migration):

    dependencies = [
        ("public_data", "0027_alter_couvertureusagematrix_label"),
    ]

    operations = [
        migrations.CreateModel(
            name="ConsoCerema",
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
                ("fid", models.FloatField(verbose_name="fid")),
                (
                    "iddep",
                    models.CharField(
                        max_length=255, null=True, verbose_name="département"
                    ),
                ),
                ("n0", models.CharField(max_length=255, null=True, verbose_name="n0")),
                ("n1", models.CharField(max_length=255, null=True, verbose_name="n1")),
                (
                    "cas",
                    models.CharField(max_length=255, null=True, verbose_name="cas"),
                ),
                (
                    "idcom",
                    models.CharField(max_length=255, null=True, verbose_name="idcom"),
                ),
                (
                    "l_idparn0",
                    models.CharField(
                        max_length=255, null=True, verbose_name="l_idparn0"
                    ),
                ),
                (
                    "l_idparn1",
                    models.CharField(
                        max_length=255, null=True, verbose_name="l_idparn1"
                    ),
                ),
                ("naf_arti", models.FloatField(verbose_name="arti_hab")),
                ("arti_act", models.FloatField(verbose_name="arti_act")),
                ("arti_mix", models.FloatField(verbose_name="arti_mix")),
                ("arti_nc", models.FloatField(verbose_name="arti_nc")),
                ("geomloc", models.CharField(max_length=255, verbose_name="id")),
                ("id_source", models.IntegerField(verbose_name="id source")),
                (
                    "mpoly",
                    django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326),
                ),
            ],
            bases=(
                public_data.behaviors.AutoLoadMixin,
                public_data.behaviors.DataColorationMixin,
                models.Model,
            ),
        ),
    ]
