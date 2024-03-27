# Generated by Django 4.2.9 on 2024-03-27 11:41

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0123_remove_ocsge_temp_departement_ocsge_departement"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="ocsge",
            name="matrix",
        ),
        migrations.AlterField(
            model_name="ocsge",
            name="departement",
            field=models.CharField(max_length=15, verbose_name="Département"),
        ),
    ]
