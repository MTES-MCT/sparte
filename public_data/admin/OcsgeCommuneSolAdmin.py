from django.contrib.gis import admin

from public_data.models import CommuneSol


@admin.register(CommuneSol)
class OcsgeCommuneSolAdmin(admin.GeoModelAdmin):
    model = CommuneSol
