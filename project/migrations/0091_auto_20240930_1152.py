# Generated by Django 4.2.13 on 2024-09-30 09:52

from django.db import migrations

from utils.validators import is_alpha_valid


def remove_invalid_user_inputs(apps, schema_editor):
    Request = apps.get_model("project", "Request")

    for request in Request.objects.all():
        if not is_alpha_valid(request.first_name):
            request.first_name = "empty"
        if not is_alpha_valid(request.last_name):
            request.last_name = "empty"
        if not is_alpha_valid(request.function):
            request.function = "empty"
        if not is_alpha_valid(request.organism):
            request.organism = "COMMUN"
        if not is_alpha_valid(request.requested_document):
            request.requested_document = "rapport-complet"
        request.save()


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0090_alter_historicalrequest_first_name_and_more"),
    ]

    operations = [
        migrations.RunPython(remove_invalid_user_inputs),
    ]