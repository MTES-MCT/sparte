from django.contrib import admin

from public_data.models import TerritorialisationObjectif


@admin.register(TerritorialisationObjectif)
class TerritorialisationObjectifAdmin(admin.ModelAdmin):
    autocomplete_fields = ["land", "parent"]
    list_display = ["land", "parent", "objectif_de_reduction"]
    search_fields = ["land__name", "land__land_id", "parent__name", "parent__land_id"]
