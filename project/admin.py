from django.contrib.gis import admin
from django.urls import exceptions, reverse
from django.utils.html import format_html
from simple_history.admin import SimpleHistoryAdmin

from project.models import ExportJob, Project, ReportDraft, Request
from public_data.models import AdminRef


@admin.register(ExportJob)
class ExportJobAdmin(admin.ModelAdmin):
    model = ExportJob
    list_display = (
        "job_id",
        "user",
        "status",
        "created_at",
        "updated_at",
        "link_to_pdf",
    )
    list_filter = ("status", "created_at")
    search_fields = ("job_id", "user__email")
    readonly_fields = (
        "job_id",
        "created_at",
        "updated_at",
        "link_to_pdf",
    )
    list_select_related = ("user",)

    def link_to_pdf(self, obj):
        if obj.pdf_file:
            return format_html('<a href="{}" target="_blank">Télécharger le PDF</a>', obj.pdf_file.url)
        return "-"

    link_to_pdf.short_description = "Fichier PDF"


@admin.register(ReportDraft)
class ReportDraftAdmin(admin.ModelAdmin):
    model = ReportDraft
    list_display = (
        "name",
        "user",
        "report_type",
        "land_type",
        "land_id",
        "created_at",
        "updated_at",
    )
    list_filter = ("report_type", "land_type", "created_at")
    search_fields = ("name", "user__email", "land_id")
    readonly_fields = ("id", "created_at", "updated_at")
    list_select_related = ("user",)


@admin.register(Project)
class ProjectAdmin(SimpleHistoryAdmin):
    model = Project
    list_select_related = ("user",)
    list_display = (
        "name",
        "user",
        "analyse_start_date",
        "analyse_end_date",
    )
    readonly_fields = (
        "cities",
        "async_complete",
        "is_ready_to_be_displayed",
    )
    search_fields = (
        "name",
        "user__email",
    )


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    model = Request
    list_display = (
        "email",
        "created_date",
        "link_to_user",
        "sent_date",
        "project_id",
        "link_to_project",
        "link_to_project_admin",
    )
    search_fields = ("email",)
    list_filter = ("done", "created_date", "sent_date")
    fieldsets = (
        (
            "Information personnelle",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "link_to_user",
                    "created_date",
                )
            },
        ),
        (
            "Requête",
            {
                "fields": (
                    "requested_document",
                    "du_en_cours",
                    "competence_urba",
                )
            },
        ),
        (
            "Réponse",
            {
                "description": "Suivre le traitement de la demande",
                "fields": (
                    "project_id",
                    "link_to_project",
                    "link_to_project_admin",
                    "sent_file",
                    "sent_date",
                    "done",
                ),
            },
        ),
    )
    readonly_fields = (
        "requested_document",
        "first_name",
        "last_name",
        "email",
        "project",
        "user",
        "link_to_user",
        "link_to_project",
        "link_to_project_admin",
        "created_date",
        "updated_date",
        "project_id",
    )

    def link_to_user(self, obj):
        if obj.user_id:
            link = reverse("admin:users_user_change", args=[obj.user_id])
            return format_html(f'<a href="{link}">Accès à la fiche</a>')
        else:
            return format_html("Demande anonyme")

    link_to_user.short_description = "Utilisateur"  # type: ignore

    def link_to_project(self, obj):
        try:
            project = Project.objects.get(id=obj.project_id)
            link = reverse(
                "project:home",
                kwargs={"land_type": AdminRef.code_to_slug(project.land_type), "land_slug": project.land_slug},
            )
            return format_html(f'<a href="{link}">Accès à la fiche</a>')
        except (Project.DoesNotExist, exceptions.NoReverseMatch):
            return format_html("Diagnostic inconnu")

    link_to_project.short_description = "Projet public"  # type: ignore

    def link_to_project_admin(self, obj):
        try:
            link = reverse("admin:project_project_change", args=[obj.project_id])
            return format_html(f'<a href="{link}">Accès à la dans l\'admin</a>')
        except exceptions.NoReverseMatch:
            return format_html("Diagnostic inconnu")

    link_to_project.short_description = "Projet admin"  # type: ignore
