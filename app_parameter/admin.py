from django.contrib import admin

from .models import Parameter


@admin.register(Parameter)
class ParameterAdmin(admin.ModelAdmin):
    model = Parameter
    list_display = (
        "name",
        "slug",
        "value",
        "value_type",
    )
    list_filter = ("value_type",)
    readonly_fields = ("slug",)
    search_fields = (
        "name",
        "slug",
        "description",
        "value",
    )
