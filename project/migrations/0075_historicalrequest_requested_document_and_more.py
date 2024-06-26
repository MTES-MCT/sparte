# Generated by Django 4.2.11 on 2024-04-24 08:50

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0074_merge_0073_auto_20240417_1049_0073_auto_20240418_1144"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicalrequest",
            name="requested_document",
            field=models.CharField(
                choices=[("RAPPORT_COMPLET", "Rapport complet"), ("RAPPORT_LOCAL", "Rapport local")],
                default="RAPPORT_COMPLET",
                max_length=30,
                verbose_name="Document demandé",
            ),
        ),
        migrations.AddField(
            model_name="request",
            name="requested_document",
            field=models.CharField(
                choices=[("RAPPORT_COMPLET", "Rapport complet"), ("RAPPORT_LOCAL", "Rapport local")],
                default="RAPPORT_COMPLET",
                max_length=30,
                verbose_name="Document demandé",
            ),
        ),
    ]
