from django.contrib.gis import admin

from .models import WorldBorder


class WorldBorderAdmin(admin.OSMGeoAdmin):
    model = WorldBorder
    list_display = (
        "name",
        "area",
        "iso2",
        "lon",
        "lat",
    )
    list_filter = (
        "region",
        "subregion",
    )
    search_fields = (
        "name",
        "iso2",
        "iso3",
        "un",
    )
    ordering = ("name",)


admin.site.register(WorldBorder, WorldBorderAdmin)
