# Generated by Django 3.2.5 on 2021-12-17 22:20

import django.contrib.gis.db.models.fields
from django.db import migrations, models

import public_data.models.mixins


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0030_alter_consocerema_mpoly"),
    ]

    operations = [
        migrations.CreateModel(
            name="RefPlan",
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
                ("city_insee", models.CharField(max_length=5)),
                ("city_name", models.CharField(max_length=45)),
                ("region_id", models.CharField(max_length=2)),
                ("region_name", models.CharField(max_length=27)),
                ("dept_id", models.CharField(max_length=3)),
                ("dept_name", models.CharField(max_length=23)),
                ("epci_id", models.CharField(max_length=9)),
                ("epci_name", models.CharField(max_length=64)),
                ("aav2020", models.CharField(max_length=3)),
                ("libaav2020", models.CharField(max_length=39)),
                ("cateaav202", models.BigIntegerField()),
                ("naf09art10", models.FloatField()),
                ("art09act10", models.FloatField()),
                ("art09hab10", models.FloatField()),
                ("art09mix10", models.FloatField()),
                ("art09inc10", models.FloatField()),
                ("naf10art11", models.FloatField()),
                ("art10act11", models.FloatField()),
                ("art10hab11", models.FloatField()),
                ("art10mix11", models.FloatField()),
                ("art10inc11", models.FloatField()),
                ("naf11art12", models.FloatField()),
                ("art11act12", models.FloatField()),
                ("art11hab12", models.FloatField()),
                ("art11mix12", models.FloatField()),
                ("art11inc12", models.FloatField()),
                ("naf12art13", models.FloatField()),
                ("art12act13", models.FloatField()),
                ("art12hab13", models.FloatField()),
                ("art12mix13", models.FloatField()),
                ("art12inc13", models.FloatField()),
                ("naf13art14", models.FloatField()),
                ("art13act14", models.FloatField()),
                ("art13hab14", models.FloatField()),
                ("art13mix14", models.FloatField()),
                ("art13inc14", models.FloatField()),
                ("naf14art15", models.FloatField()),
                ("art14act15", models.FloatField()),
                ("art14hab15", models.FloatField()),
                ("art14mix15", models.FloatField()),
                ("art14inc15", models.FloatField()),
                ("naf15art16", models.FloatField()),
                ("art15act16", models.FloatField()),
                ("art15hab16", models.FloatField()),
                ("art15mix16", models.FloatField()),
                ("art15inc16", models.FloatField()),
                ("naf16art17", models.FloatField()),
                ("art16act17", models.FloatField()),
                ("art16hab17", models.FloatField()),
                ("art16mix17", models.FloatField()),
                ("art16inc17", models.FloatField()),
                ("naf17art18", models.FloatField()),
                ("art17act18", models.FloatField()),
                ("art17hab18", models.FloatField()),
                ("art17mix18", models.FloatField()),
                ("art17inc18", models.FloatField()),
                ("naf18art19", models.FloatField()),
                ("art18act19", models.FloatField()),
                ("art18hab19", models.FloatField()),
                ("art18mix19", models.FloatField()),
                ("art18inc19", models.FloatField()),
                ("naf19art20", models.FloatField()),
                ("art19act20", models.FloatField()),
                ("art19hab20", models.FloatField()),
                ("art19mix20", models.FloatField()),
                ("art19inc20", models.FloatField()),
                ("nafart0920", models.FloatField()),
                ("artact0920", models.FloatField()),
                ("arthab0920", models.FloatField()),
                ("artmix0920", models.FloatField()),
                ("artinc0920", models.FloatField()),
                ("artcom0920", models.FloatField()),
                ("pop12", models.BigIntegerField()),
                ("pop17", models.BigIntegerField()),
                ("pop1217", models.BigIntegerField()),
                ("men12", models.BigIntegerField()),
                ("men17", models.BigIntegerField()),
                ("men1217", models.BigIntegerField()),
                ("emp17", models.BigIntegerField()),
                ("emp12", models.BigIntegerField()),
                ("emp1217", models.BigIntegerField()),
                ("mepart1217", models.FloatField()),
                ("menhab1217", models.FloatField()),
                ("artpop1217", models.FloatField()),
                ("surfcom20", models.FloatField()),
                (
                    "mpoly",
                    django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326),
                ),
            ],
            bases=(
                public_data.models.mixins.DataColorationMixin,
                models.Model,
            ),
        ),
        migrations.DeleteModel(
            name="ConsoCerema",
        ),
    ]
