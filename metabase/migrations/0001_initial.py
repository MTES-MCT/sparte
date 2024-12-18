# Generated by Django 4.2.13 on 2024-12-18 12:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("project", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="StatDiagnostic",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_date", models.DateTimeField(verbose_name="Date de création")),
                ("is_anonymouse", models.BooleanField(default=True, verbose_name="Est anonyme")),
                ("is_public", models.BooleanField(default=True, verbose_name="Est public")),
                (
                    "administrative_level",
                    models.CharField(blank=True, max_length=255, null=True, verbose_name="Niveau administratif"),
                ),
                ("analysis_level", models.CharField(max_length=255, verbose_name="Maille d'analyse")),
                ("start_date", models.DateField(verbose_name="Date de début")),
                ("end_date", models.DateField(verbose_name="Date de fin")),
                ("link", models.CharField(max_length=255, verbose_name="Lien vers le diagnostic")),
                ("city", models.CharField(blank=True, max_length=255, null=True, verbose_name="Commune")),
                ("epci", models.CharField(blank=True, max_length=255, null=True, verbose_name="EPCI")),
                ("scot", models.CharField(blank=True, max_length=255, null=True, verbose_name="SCoT")),
                ("departement", models.CharField(blank=True, max_length=255, null=True, verbose_name="Département")),
                ("region", models.CharField(blank=True, max_length=255, null=True, verbose_name="Région")),
                ("is_downaloaded", models.BooleanField(default=False, verbose_name="A été téléchargé")),
                (
                    "date_first_download",
                    models.DateTimeField(blank=True, null=True, verbose_name="Date du premier téléchargement"),
                ),
                ("organism", models.CharField(blank=True, max_length=255, null=True, verbose_name="Organisme")),
                (
                    "group_organism",
                    models.CharField(blank=True, max_length=50, null=True, verbose_name="Groupe d'organisme"),
                ),
                (
                    "project",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.project",
                        verbose_name="Diagnostic d'origine",
                    ),
                ),
                (
                    "request",
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="project.request"
                    ),
                ),
            ],
            options={
                "verbose_name": "Statistique",
                "ordering": ["-created_date"],
            },
        ),
    ]
