from django.contrib.gis import admin
from django.utils.safestring import mark_safe

from public_data.models import LandStaticFigure


@admin.register(LandStaticFigure)
class LandStaticFigureAdmin(admin.GeoModelAdmin):
    model = LandStaticFigure

    readonly_fields = ["figure_image", "created_at", "updated_at"]

    def figure_image(self, obj: LandStaticFigure):
        return mark_safe(
            '<img loading="lazy" src="{url}" width="{width}" height={height} />'.format(
                url=obj.figure.url,
                width=obj.figure.width,
                height=obj.figure.height,
            )
        )
