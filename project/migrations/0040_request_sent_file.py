# Generated by Django 3.2.14 on 2022-08-01 10:06

from django.db import migrations, models
import project.models.project


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0039_alter_project_territory_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="request",
            name="sent_file",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to=project.models.project.upload_in_project_folder,
            ),
        ),
    ]
