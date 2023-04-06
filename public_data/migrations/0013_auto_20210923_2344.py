# Generated by Django 3.2.5 on 2021-09-23 23:44

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0012_ocsge2015"),
    ]

    operations = [
        migrations.AlterField(
            model_name="ocsge2015",
            name="commentaire",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Commentaire"),
        ),
        migrations.AlterField(
            model_name="ocsge2015",
            name="couverture",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Couverture du sol"),
        ),
        migrations.AlterField(
            model_name="ocsge2015",
            name="millesime",
            field=models.DateField(blank=True, null=True, verbose_name="Millésime"),
        ),
        migrations.AlterField(
            model_name="ocsge2015",
            name="origine",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Origine"),
        ),
        migrations.AlterField(
            model_name="ocsge2015",
            name="origine2",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Origine1"),
        ),
        migrations.AlterField(
            model_name="ocsge2015",
            name="source",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Source"),
        ),
        migrations.AlterField(
            model_name="ocsge2015",
            name="usage",
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name="Usage du sol"),
        ),
    ]
