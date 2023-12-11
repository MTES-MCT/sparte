# Generated by Django 4.2.6 on 2023-12-04 08:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0061_historicalproject_async_ocsge_status_done_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicalproject",
            name="ocsge_coverage_status",
            field=models.CharField(
                choices=[
                    ("COMPLETE_UNIFORM", "Complet et uniforme"),
                    ("COMPLETE_NOT_UNIFORM", "Complet mais non uniforme"),
                    ("PARTIAL", "Partiel"),
                    ("NO_DATA", "Aucune donnée"),
                    ("UNDEFINED", "Non défini"),
                ],
                default="UNDEFINED",
                max_length=20,
                verbose_name="Statut de la couverture OCS GE",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="ocsge_coverage_status",
            field=models.CharField(
                choices=[
                    ("COMPLETE_UNIFORM", "Complet et uniforme"),
                    ("COMPLETE_NOT_UNIFORM", "Complet mais non uniforme"),
                    ("PARTIAL", "Partiel"),
                    ("NO_DATA", "Aucune donnée"),
                    ("UNDEFINED", "Non défini"),
                ],
                default="UNDEFINED",
                max_length=20,
                verbose_name="Statut de la couverture OCS GE",
            ),
        ),
    ]