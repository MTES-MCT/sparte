# Generated by Django 3.2.5 on 2021-08-23 14:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0002_project_user"),
    ]

    operations = [
        migrations.RenameField(
            model_name="project",
            old_name="shape_files",
            new_name="shape_file",
        ),
    ]
