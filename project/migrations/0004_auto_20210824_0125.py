# Generated by Django 3.2.5 on 2021-08-24 01:25

import django.contrib.gis.db.models.fields
import django.db.models.deletion
from django.db import migrations, models

import project.models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0003_rename_shape_files_project_shape_file"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="project",
            options={"ordering": ["name"]},
        ),
        migrations.AddField(
            model_name="project",
            name="import_date",
            field=models.DateTimeField(blank=True, null=True, verbose_name="import date & time"),
        ),
        migrations.AddField(
            model_name="project",
            name="import_error",
            field=models.TextField(blank=True, null=True, verbose_name="shp file import error message"),
        ),
        migrations.AddField(
            model_name="project",
            name="import_status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Import pending to be processed"),
                    ("SUCCESS", "Import successfuly processed"),
                    ("FAILED", "Import failed, see import message"),
                ],
                default="PENDING",
                max_length=10,
                verbose_name="",
            ),
        ),
        migrations.AlterField(
            model_name="project",
            name="shape_file",
            field=models.FileField(upload_to=project.models.user_directory_path, verbose_name="shape files"),
        ),
        migrations.CreateModel(
            name="Emprise",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "mpoly",
                    django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="project.project",
                        verbose_name="project",
                    ),
                ),
            ],
            options={
                "ordering": ["project"],
            },
        ),
    ]
