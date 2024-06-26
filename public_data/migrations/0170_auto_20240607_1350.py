# Generated by Django 4.2.13 on 2024-06-07 11:50

from django.db import migrations


def remove_hamp_epci(apps, schema_editor):
    # Remove the EPCI with the name "hamp" as it is not a real EPCI
    # and does not seem to match any real administrative entity
    Epci = apps.get_model("public_data", "Epci")

    try:
        hamp = Epci.objects.get(name="hamp")
    except Epci.DoesNotExist:
        return

    # Remove the EPCI from the communes that are linked to it
    for commune in hamp.commune_set.all():
        commune.epci = None
        commune.save()

    hamp.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0169_alter_sudocuhepci_date_creation_epci"),
    ]

    operations = [migrations.RunPython(remove_hamp_epci)]
