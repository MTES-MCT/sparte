from django.contrib.gis import admin

from public_data.models import DataSource


@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    model = DataSource
    list_display = (
        "dataset",
        "name",
        "official_land_id",
        "millesimes",
    )
    search_fields = (
        "productor",
        "dataset",
        "name",
        "official_land_id",
    )
    ordering = ("productor", "dataset", "name")
