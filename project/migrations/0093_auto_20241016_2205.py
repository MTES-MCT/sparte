# Generated by Django 4.2.13 on 2024-10-16 20:05

from django.db import migrations


def delete_scot_projects(apps, schema_editor):
    Project = apps.get_model("project", "Project")
    Project.objects.filter(land_type="SCOT").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0092_remove_historicalproject_couverture_usage_and_more"),
    ]

    operations = [
        migrations.RunPython(delete_scot_projects),
    ]
