from django.contrib.gis import admin

from public_data.models import Cerema


@admin.register(Cerema)
class CeremaAdmin(admin.GeoModelAdmin):
    model = Cerema
    list_display = (
        "city_insee",
        "city_name",
        "region_id",
        "region_name",
        "dept_id",
        "dept_name",
        "epci_id",
        "epci_name",
    )
    search_fields = ("city_insee", "city_name", "region_name", "dept_name", "epci_name")
    ordering = ("city_insee",)
