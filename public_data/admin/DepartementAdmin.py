from django.contrib.gis import admin

from public_data.models import Departement


@admin.register(Departement)
class DepartementAdmin(admin.GeoModelAdmin):
    model = Departement
    list_display = (
        "id",
        "name",
        "source_id",
        "region",
    )
    search_fields = ("name", "source_id")
    ordering = ("name",)
