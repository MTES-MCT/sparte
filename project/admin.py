from django.contrib.gis import admin
from django.http import HttpResponseRedirect

from .models import Project, Emprise
from .tasks import process_new_project


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
    change_form_template = "project/admin_detail.html"

    def response_change(self, request, obj):
        if "_reload-emprise-action" in request.POST:
            # Trigger asynch task to reload emprise file
            process_new_project.delay(obj.id)
            return HttpResponseRedirect(".")  # stay on the same detail page
        return super().response_change(request, obj)


@admin.register(Emprise)
class EmpriseAdmin(admin.GeoModelAdmin):
    model = Emprise
    list_display = (
        "id",
        "project",
    )
    search_fields = ("project",)
