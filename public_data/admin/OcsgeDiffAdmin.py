from django.contrib.gis import admin

from public_data.models import OcsgeDiff


@admin.register(OcsgeDiff)
class OcsgeDiffAdmin(admin.GISModelAdmin):
    model = OcsgeDiff
