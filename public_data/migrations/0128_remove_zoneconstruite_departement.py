# Generated by Django 4.2.9 on 2024-03-27 15:50

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0127_auto_20240327_1548"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="zoneconstruite",
            name="departement",
        ),
    ]
