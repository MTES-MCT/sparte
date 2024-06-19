from django.contrib.gis import admin

from public_data.models import Ocsge


@admin.register(Ocsge)
class OcsgeAdmin(admin.GeoModelAdmin):
    model = Ocsge
    list_display = (
        "id",
        "couverture",
        "usage",
        "year",
    )
    list_filter = ("year", "couverture", "usage")
    search_fields = (
        "couverture",
        "usage",
        "year",
    )
