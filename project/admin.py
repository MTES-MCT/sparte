from django.contrib.gis import admin
from django.http import HttpResponseRedirect
from django.urls import reverse, exceptions
from django.utils.html import format_html

from .models import Project, Emprise, Plan, PlanEmprise, Request
from .tasks import process_project, process_new_plan


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
        "user__email",
    )
    ordering = ("name",)
    filter_horizontal = ("cities",)
    change_form_template = "project/admin_detail.html"

    def response_change(self, request, obj):
        if "_reload-emprise-action" in request.POST:
            # Trigger asynch task to reload emprise file
            process_project.delay(obj.id)
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


@admin.register(Plan)
class PlanAdmin(admin.GeoModelAdmin):
    model = Plan
    list_display = (
        "name",
        "project",
        "user",
        "import_status",
        "import_date",
    )
    list_filter = ("import_status",)
    search_fields = (
        "project",
        "name",
        "import_error",
        "user",
    )
    ordering = ("name",)
    change_form_template = "project/admin_detail.html"

    def response_change(self, request, obj):
        if "_reload-emprise-action" in request.POST:
            # Trigger asynch task to reload emprise file
            process_new_plan.delay(obj.id)
            return HttpResponseRedirect(".")  # stay on the same detail page
        return super().response_change(request, obj)


@admin.register(PlanEmprise)
class PlanEmpriseAdmin(admin.GeoModelAdmin):
    model = PlanEmprise
    list_display = (
        "id",
        "plan",
    )
    search_fields = ("plan",)


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    model = Request
    list_display = (
        "email",
        "created_date",
        "link_to_user",
        "sent_date",
        "link_to_project",
    )
    search_fields = ("email",)
    fieldsets = (
        (
            "Information personnelle",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "organism",
                    "function",
                    "email",
                    "link_to_user",
                )
            },
        ),
        (
            "Réponse",
            {
                "description": "Suivre le traitement de la demande",
                "fields": ("link_to_project", "sent_file", "sent_date", "done"),
            },
        ),
    )
    readonly_fields = (
        "first_name",
        "last_name",
        "function",
        "organism",
        "email",
        "project",
        "user",
        "link_to_user",
        "link_to_project",
        "created_date",
        "updated_date",
    )

    def link_to_user(self, obj):
        if obj.user_id:
            link = reverse("admin:users_user_change", args=[obj.user_id])
            return format_html(f'<a href="{link}">Accès à la fiche</a>')
        else:
            return format_html("Demande anonyme")

    link_to_user.short_description = "Utilisateur"

    def link_to_project(self, obj):
        try:
            link = reverse("project:detail", args=[obj.project_id])
            return format_html(f'<a href="{link}">Accès à la fiche</a>')
        except exceptions.NoReverseMatch:
            return format_html("Diagnostic inconnu")

    link_to_project.short_description = "Projet"
