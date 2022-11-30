from django.contrib import messages
from django.contrib.gis import admin
from django.http import HttpResponseRedirect
from django.urls import reverse, exceptions
from django.utils.html import format_html


from .models import Project, Request, ErrorTracking
from . import tasks


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
    change_form_template = "project/admin/project_detail.html"

    def response_change(self, request, obj):
        if "_generate-conso-map" in request.POST:
            tasks.generate_theme_map_conso.delay(obj.id)
            msg = "Génération de la carte thématique de la consommation en cours"
            messages.add_message(request, messages.INFO, msg)
            return HttpResponseRedirect(".")
        elif "_generate-artif-map" in request.POST:
            tasks.generate_theme_map_artif.delay(obj.id)
            msg = "Génération de la carte thématique de l'artificialisation en cours"
            messages.add_message(request, messages.INFO, msg)
            return HttpResponseRedirect(".")
        elif "_generate-understand-artif-map" in request.POST:
            tasks.generate_theme_map_understand_artif.delay(obj.id)
            msg = "Génération de la carte thématique Comprendre Son Artif. en cours"
            messages.add_message(request, messages.INFO, msg)
            return HttpResponseRedirect(".")
        elif "_generate-cover" in request.POST:
            tasks.generate_cover_image.delay(obj.id)
            msg = "Génération de l'image de couverture en cours"
            messages.add_message(request, messages.INFO, msg)
            return HttpResponseRedirect(".")
        return super().response_change(request, obj)


class ErrorTrackingAdmin(admin.StackedInline):
    model = ErrorTracking
    list_display = (
        "id",
        "request",
        "created_date",
    )
    readonly_fields = (
        "id",
        "request",
        "created_date",
        "exception",
    )
    extra = 0
    verbose_name = "Exception"
    can_delete = False

    def has_add_permission(self, request, obj):
        return False


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
    list_filter = ("done", "created_date", "sent_date")
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
                    "created_date",
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
    inlines = [ErrorTrackingAdmin]
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

    change_form_template = "project/admin_request_detail.html"

    def response_change(self, request, obj):
        if "_send-action" in request.POST:
            obj.done = False
            obj.sent_date = None
            obj.save()
            tasks.send_word_diagnostic.delay(obj.id)
            return HttpResponseRedirect(".")
        elif "_generate-action" in request.POST:
            obj.sent_file.delete(save=True)
            tasks.generate_word_diagnostic.delay(obj.id)
            return HttpResponseRedirect(".")
        return super().response_change(request, obj)
