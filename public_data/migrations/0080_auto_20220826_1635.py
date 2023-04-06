# Generated by Django 3.2.15 on 2022-08-26 16:35

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0079_rename_menage_communepop_household"),
    ]

    operations = [
        migrations.AddField(
            model_name="communepop",
            name="household_change",
            field=models.IntegerField(blank=True, null=True, verbose_name="Population"),
        ),
        migrations.AddField(
            model_name="communepop",
            name="pop_change",
            field=models.IntegerField(blank=True, null=True, verbose_name="Population"),
        ),
    ]
