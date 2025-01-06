# Generated by Django 4.2.13 on 2024-10-16 20:17

from django.db import migrations
from public_data.models import AdminRef


def set_land_id_from_primary_keys_to_natural_key(apps, schema_editor):  # noqa: C901
    Project = apps.get_model("project", "Project")

    for project in Project.objects.all():
        land_type = project.land_type
        klass = None

        if not project.land_id:
            project.delete()
            continue
        if project.land_id and "," in str(project.land_id):
            project.delete()
            continue
        if land_type == AdminRef.COMMUNE:
            try:
                klass = apps.get_model("public_data", "Commune")
                new_land_id = klass.objects.get(id=project.land_id).insee
            except klass.DoesNotExist:
                project.delete()
                continue
        elif land_type == AdminRef.EPCI:
            try:
                klass = apps.get_model("public_data", "Epci")
                new_land_id = klass.objects.get(id=project.land_id).source_id
            except klass.DoesNotExist:
                project.delete()
                continue
        elif land_type == AdminRef.DEPARTEMENT:
            try:
                klass = apps.get_model("public_data", "Departement")
                new_land_id = klass.objects.get(id=project.land_id).source_id
            except klass.DoesNotExist:
                project.delete()
                continue
        elif land_type == AdminRef.REGION:
            try:
                klass = apps.get_model("public_data", "Region")
                new_land_id = klass.objects.get(id=project.land_id).source_id
            except klass.DoesNotExist:
                project.delete()
                continue
        else:
            project.delete()
            continue

        project.land_id = new_land_id
        project.save()


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0093_auto_20241016_2205"),
    ]

    operations = [migrations.RunPython(set_land_id_from_primary_keys_to_natural_key)]
