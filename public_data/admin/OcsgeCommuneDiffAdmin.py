from django.contrib.gis import admin

from public_data.models import CommuneDiff


@admin.register(CommuneDiff)
class OcsgeCommuneDiffAdmin(admin.GeoModelAdmin):
    model = CommuneDiff
