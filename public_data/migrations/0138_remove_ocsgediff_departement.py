# Generated by Django 4.2.9 on 2024-03-27 16:53

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0137_auto_20240327_1651"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="ocsgediff",
            name="departement",
        ),
    ]
