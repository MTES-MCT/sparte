from django.contrib.gis import admin

from public_data.models import Scot


@admin.register(Scot)
class ScotAdmin(admin.GeoModelAdmin):
    model = Scot
