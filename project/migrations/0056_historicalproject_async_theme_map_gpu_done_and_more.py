# Generated by Django 4.2.3 on 2023-08-02 13:38

from django.db import connection, migrations, models

import config.storages
import project.models.project_base


def set_async_theme_map_gpu_to_false(apps, schema_editor):
    query = "UPDATE project_historicalproject SET async_theme_map_gpu_done = false"
    with connection.cursor() as cursor:
        cursor.execute(query)


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0055_alter_historicalproject_target_2031_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicalproject",
            name="async_theme_map_gpu_done",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="historicalproject",
            name="theme_map_gpu",
            field=models.TextField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="project",
            name="async_theme_map_gpu_done",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="project",
            name="theme_map_gpu",
            field=models.ImageField(
                blank=True,
                null=True,
                storage=config.storages.PublicMediaStorage(),
                upload_to=project.models.project_base.upload_in_project_folder,
            ),
        ),
        migrations.RunPython(set_async_theme_map_gpu_to_false, reverse_code=migrations.RunPython.noop),
    ]
