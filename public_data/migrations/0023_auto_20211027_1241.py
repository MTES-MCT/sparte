# Generated by Django 3.2.5 on 2021-10-27 12:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("public_data", "0022_auto_20211025_2135"),
    ]

    operations = [
        migrations.AddField(
            model_name="couverturesol",
            name="map_color",
            field=models.CharField(
                blank=True, max_length=8, null=True, verbose_name="Couleur"
            ),
        ),
        migrations.AddField(
            model_name="usagesol",
            name="map_color",
            field=models.CharField(
                blank=True, max_length=8, null=True, verbose_name="Couleur"
            ),
        ),
    ]
