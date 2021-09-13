# Generated by Django 3.2.5 on 2021-09-11 14:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0007_alter_project_cities"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="import_status",
            field=models.CharField(
                choices=[
                    ("MISSING", "Waiting file or manual selection"),
                    ("PENDING", "Import pending to be processed"),
                    ("SUCCESS", "Import successfuly processed"),
                    ("FAILED", "Import failed, see import message"),
                ],
                default="PENDING",
                max_length=10,
                verbose_name="import status",
            ),
        ),
    ]
