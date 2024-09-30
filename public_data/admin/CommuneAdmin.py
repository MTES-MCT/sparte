from django.contrib.gis import admin

from public_data.models import Commune


@admin.register(Commune)
class CommuneAdmin(admin.GISModelAdmin):
    model = Commune
    list_display = (
        "insee",
        "name",
    )
    search_fields = ("name", "insee")
    ordering = ("insee",)
