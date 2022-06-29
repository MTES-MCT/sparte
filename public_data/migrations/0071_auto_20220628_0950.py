# Generated by Django 3.2.13 on 2022-06-28 09:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("public_data", "0070_auto_20220628_0949"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="communediff",
            index=models.Index(
                fields=["year_old"], name="public_data_year_ol_fcae8a_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="communediff",
            index=models.Index(
                fields=["year_new"], name="public_data_year_ne_94c0aa_idx"
            ),
        ),
    ]
