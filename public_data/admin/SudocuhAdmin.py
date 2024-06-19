from django.contrib.gis import admin

from public_data.models import Sudocuh


@admin.register(Sudocuh)
class SudocuhAdmin(admin.GeoModelAdmin):
    model = Sudocuh
    list_display = (
        "nom_commune",
        "code_insee",
    )
    search_fields = (
        "code_insee",
        "nom_region",
        "code_departement",
        "nom_commune",
        "siren_epci",
    )
    ordering = ("nom_commune",)
