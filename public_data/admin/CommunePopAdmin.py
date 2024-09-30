from django.contrib.gis import admin

from public_data.models import CommunePop


@admin.register(CommunePop)
class CommunePopAdmin(admin.GISModelAdmin):
    model = CommunePop
