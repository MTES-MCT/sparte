from django.contrib.gis import admin

from public_data.models import Region


@admin.register(Region)
class RegionAdmin(admin.GISModelAdmin):
    model = Region
    list_display = (
        "id",
        "name",
        "source_id",
    )
    search_fields = ("name", "source_id")
    ordering = ("name",)
