from django.contrib.gis import admin

from public_data.models import ZoneConstruite


@admin.register(ZoneConstruite)
class OcsgeZoneConstruiteAdmin(admin.GISModelAdmin):
    model = ZoneConstruite
