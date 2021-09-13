# Generated by Django 3.2.5 on 2021-09-13 17:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0009_auto_20210913_1732"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="description",
            field=models.TextField(blank=True, verbose_name="Description"),
        ),
        migrations.AlterField(
            model_name="project",
            name="import_status",
            field=models.CharField(
                choices=[
                    ("MISSING", "Emprise à renseigner"),
                    ("PENDING", "Traitement du fichier Shape en cours"),
                    ("SUCCESS", "Emprise renseignée"),
                    ("FAILED", "Création de l'emprise échouée"),
                ],
                default="MISSING",
                max_length=10,
                verbose_name="Statut import",
            ),
        ),
    ]
