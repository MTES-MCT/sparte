# Generated by Django 3.2.5 on 2022-01-11 22:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0021_auto_20220111_1953"),
    ]

    operations = [
        migrations.AddField(
            model_name="plan",
            name="emprise_origin",
            field=models.CharField(
                choices=[
                    ("FROM_SHP", "Construit depuis un fichier shape"),
                    ("FROM_CITIES", "Construit depuis une liste de villes"),
                    ("WITH_EMPRISE", "Emprise déjà fournie"),
                ],
                default="FROM_SHP",
                max_length=20,
                verbose_name="Origine de l'emprise",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="emprise_origin",
            field=models.CharField(
                choices=[
                    ("FROM_SHP", "Construit depuis un fichier shape"),
                    ("FROM_CITIES", "Construit depuis une liste de villes"),
                    ("WITH_EMPRISE", "Emprise déjà fournie"),
                ],
                default="FROM_SHP",
                max_length=20,
                verbose_name="Origine de l'emprise",
            ),
        ),
    ]
