# Generated by Django 4.2 on 2023-05-04 08:19
from django.db import migrations, models
from django.db.models import F


def forwards(apps, schema_editor):
    Project = apps.get_model("project", "Project")
    Project.objects.update(async_set_combined_emprise_done=F("async_add_city_done"))


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0052_alter_historicalproject_target_2031_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="historicalproject",
            old_name="async_city_and_combined_emprise_done",
            new_name="async_add_city_done",
        ),
        migrations.RenameField(
            model_name="project",
            old_name="async_city_and_combined_emprise_done",
            new_name="async_add_city_done",
        ),
        migrations.AddField(
            model_name="historicalproject",
            name="async_set_combined_emprise_done",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="project",
            name="async_set_combined_emprise_done",
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(forwards, reverse_code=migrations.RunPython.noop),
    ]
