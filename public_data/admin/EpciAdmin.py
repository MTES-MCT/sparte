from django.contrib.gis import admin

from public_data.models import Epci


@admin.register(Epci)
class EpciAdmin(admin.GeoModelAdmin):
    model = Epci
    list_display = (
        "id",
        "name",
        "source_id",
    )
    search_fields = ("name", "source_id")
    ordering = ("name",)
