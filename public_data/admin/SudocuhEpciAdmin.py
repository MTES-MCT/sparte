from django.contrib.gis import admin

from public_data.models import SudocuhEpci


@admin.register(SudocuhEpci)
class SudocuhEpciAdmin(admin.GISModelAdmin):
    model = SudocuhEpci
    list_display = (
        "nom_epci",
        "siren",
    )
    search_fields = (
        "siren",
        "nom_epci",
    )
    ordering = ("nom_epci",)
