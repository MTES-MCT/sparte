# Generated by Django 3.2.5 on 2021-09-26 23:32

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0017_auto_20210924_2219"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="artificielle2018",
            name="usage_label",
        ),
        migrations.AddField(
            model_name="artificialisee2015to2018",
            name="cs_2015_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Couverture 2015"),
        ),
        migrations.AddField(
            model_name="artificialisee2015to2018",
            name="cs_2018_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Couverture 2018"),
        ),
        migrations.AddField(
            model_name="artificialisee2015to2018",
            name="us_2015_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Usage 2015"),
        ),
        migrations.AddField(
            model_name="artificialisee2015to2018",
            name="us_2018_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Usage 2018"),
        ),
        migrations.AddField(
            model_name="enveloppeurbaine2018",
            name="couverture_label",
            field=models.CharField(
                blank=True,
                max_length=254,
                null=True,
                verbose_name="Libellé couverture du sol",
            ),
        ),
        migrations.AddField(
            model_name="renaturee2018to2015",
            name="cs_2015_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Couverture 2015"),
        ),
        migrations.AddField(
            model_name="renaturee2018to2015",
            name="cs_2018_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Couverture 2018"),
        ),
        migrations.AddField(
            model_name="renaturee2018to2015",
            name="us_2015_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Usage 2015"),
        ),
        migrations.AddField(
            model_name="renaturee2018to2015",
            name="us_2018_label",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Usage 2018"),
        ),
        migrations.AddField(
            model_name="voirie2018",
            name="couverture_label",
            field=models.CharField(
                blank=True,
                max_length=254,
                null=True,
                verbose_name="Libellé couverture du sol",
            ),
        ),
        migrations.AddField(
            model_name="zonesbaties2018",
            name="couverture_label",
            field=models.CharField(
                blank=True,
                max_length=254,
                null=True,
                verbose_name="Libellé couverture du sol",
            ),
        ),
        migrations.AddField(
            model_name="zonesbaties2018",
            name="usage_label",
            field=models.CharField(
                blank=True,
                max_length=254,
                null=True,
                verbose_name="Libellé usage du sol",
            ),
        ),
    ]
