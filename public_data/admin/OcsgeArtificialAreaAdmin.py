from django.contrib.gis import admin

from public_data.models import ArtificialArea


@admin.register(ArtificialArea)
class OcsgeArtificialAreaAdmin(admin.GeoModelAdmin):
    model = ArtificialArea
