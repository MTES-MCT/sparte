# Generated by Django 4.2.6 on 2023-11-21 11:55

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0060_alter_errortracking_options"),
    ]

    operations = [
        migrations.AddField(
            model_name="emprise",
            name="srid_source",
            field=models.IntegerField(
                choices=[
                    (2154, "Lambert 93"),
                    (32620, "Wgs 84 Utm Zone 20"),
                    (2972, "Rgfg 95 Utm Zone 22N"),
                    (2975, "Rgr 92 Utm Zone 40S"),
                    (4326, "Wgs 84"),
                    (3857, "Web Mercator"),
                ],
                default=2154,
                verbose_name="SRID",
            ),
        ),
    ]
