# Generated by Django 3.2.13 on 2022-05-16 07:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0065_alter_artificialarea_city"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="artificialarea",
            index=models.Index(fields=["year"], name="public_data_year_538ca6_idx"),
        ),
        migrations.AddIndex(
            model_name="artificialarea",
            index=models.Index(fields=["city"], name="public_data_city_id_764b05_idx"),
        ),
        migrations.AddIndex(
            model_name="artificialarea",
            index=models.Index(fields=["city", "year"], name="public_data_city_id_26b070_idx"),
        ),
        migrations.AddConstraint(
            model_name="artificialarea",
            constraint=models.UniqueConstraint(fields=("city", "year"), name="artificialarea-city-year-unique"),
        ),
    ]
