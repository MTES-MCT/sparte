# Generated by Django 3.2.13 on 2022-06-28 09:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0069_ocsge_public_data_year_3fae3a_idx"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="ocsgediff",
            index=models.Index(fields=["year_old"], name="public_data_year_ol_5a93b8_idx"),
        ),
        migrations.AddIndex(
            model_name="ocsgediff",
            index=models.Index(fields=["year_new"], name="public_data_year_ne_8fc48d_idx"),
        ),
        migrations.AddIndex(
            model_name="zoneconstruite",
            index=models.Index(fields=["year"], name="public_data_year_d61d45_idx"),
        ),
    ]
