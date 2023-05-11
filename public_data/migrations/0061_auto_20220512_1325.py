# Generated by Django 3.2.13 on 2022-05-12 13:25

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0060_auto_20220512_1303"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="communesol",
            index=models.Index(fields=["city", "matrix", "year"], name="communesol-triplet-index"),
        ),
        migrations.AddIndex(
            model_name="communesol",
            index=models.Index(fields=["city"], name="communesol-city-index"),
        ),
        migrations.AddIndex(
            model_name="communesol",
            index=models.Index(fields=["year"], name="communesol-year-index"),
        ),
        migrations.AddIndex(
            model_name="communesol",
            index=models.Index(fields=["matrix"], name="communesol-matrix-index"),
        ),
        migrations.AddIndex(
            model_name="couvertureusagematrix",
            index=models.Index(fields=["is_artificial"], name="matrix-is_artificial-index"),
        ),
        migrations.AddConstraint(
            model_name="couvertureusagematrix",
            constraint=models.UniqueConstraint(fields=("couverture", "usage"), name="matrix-couverture-usage-unique"),
        ),
    ]
