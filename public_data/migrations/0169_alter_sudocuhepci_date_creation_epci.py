# Generated by Django 4.2.13 on 2024-06-03 12:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0168_sudocuhepci"),
    ]

    operations = [
        migrations.AlterField(
            model_name="sudocuhepci",
            name="date_creation_epci",
            field=models.DateField(null=True),
        ),
    ]
