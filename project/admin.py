from django.contrib.gis import admin

from .models import Project, Emprise


@admin.register(Project)
class ProjectAdmin(admin.GeoModelAdmin):
    model = Project
    list_display = (
        "name",
        "user",
        "analyse_start_date",
        "analyse_end_date",
        "import_status",
        "import_date",
    )
    list_filter = ("import_status",)
    search_fields = (
        "name",
        "import_error",
        "user",
    )
    ordering = ("name",)
    filter_horizontal = ("cities",)


@admin.register(Emprise)
class EmpriseAdmin(admin.GeoModelAdmin):
    model = Emprise
    list_display = (
        "id",
        "project",
    )
    search_fields = ("project",)
