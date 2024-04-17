# Generated by Django 4.2.9 on 2024-03-27 17:41

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0142_remove_ocsgediff_cs_new_label_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="ocsgediff",
            name="cs_new",
            field=models.CharField(max_length=12, verbose_name="Code nouvelle couverture"),
        ),
        migrations.AlterField(
            model_name="ocsgediff",
            name="cs_old",
            field=models.CharField(max_length=12, verbose_name="Code ancienne couverture"),
        ),
        migrations.AlterField(
            model_name="ocsgediff",
            name="surface",
            field=models.DecimalField(decimal_places=4, max_digits=15, verbose_name="surface"),
        ),
        migrations.AlterField(
            model_name="ocsgediff",
            name="us_new",
            field=models.CharField(max_length=12, verbose_name="Code nouveau usage"),
        ),
        migrations.AlterField(
            model_name="ocsgediff",
            name="us_old",
            field=models.CharField(max_length=12, verbose_name="Code ancien usage"),
        ),
    ]