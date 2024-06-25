from django.contrib.gis import admin

from public_data.models import CommunePop


@admin.register(CommunePop)
class CommunePopAdmin(admin.GeoModelAdmin):
    model = CommunePop
