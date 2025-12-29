from django.contrib import admin

from public_data.models import LandModel


@admin.register(LandModel)
class LandModelAdmin(admin.ModelAdmin):
    search_fields = ["name", "land_id", "land_type"]
