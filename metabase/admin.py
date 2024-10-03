from django.contrib.gis import admin

from metabase.models import StatDiagnostic


@admin.register(StatDiagnostic)
class StatDiagnosticAdmin(admin.GISModelAdmin):
    model = StatDiagnostic
    list_display = (
        "created_date",
        "city",
        "epci",
        "scot",
        "departement",
        "region",
        "is_downaloaded",
        "date_first_download",
    )
    list_filter = ("is_downaloaded", "is_anonymouse", "is_public")
