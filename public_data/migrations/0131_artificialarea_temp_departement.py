# Generated by Django 4.2.9 on 2024-03-27 16:03

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0130_alter_zoneconstruite_departement"),
    ]

    operations = [
        migrations.AddField(
            model_name="artificialarea",
            name="temp_departement",
            field=models.CharField(blank=True, max_length=15, null=True, verbose_name="Département"),
        ),
    ]