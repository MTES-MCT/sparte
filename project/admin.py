from django.contrib import messages
from django.contrib.gis import admin
from django.http import HttpResponseRedirect
from django.urls import exceptions, reverse
from django.utils.html import format_html
from simple_history.admin import SimpleHistoryAdmin

from project import tasks
from project.models import (
    ErrorTracking,
    Project,
    Request,
    RNUPackage,
    RNUPackageRequest,
)
from project.models.exceptions import TooOldException


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
    change_form_template = "project/admin/project_detail.html"
    history_list_display = [
        "async_add_city_done",
        "async_set_combined_emprise_done",
        "async_cover_image_done",
        "async_add_comparison_lands_done",
        "async_generate_theme_map_conso_done",
    ]

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

        elif "_generate-all" in request.POST:
            from project.models import trigger_async_tasks

            try:
                public_key = obj.get_public_key()
                trigger_async_tasks(obj, public_key)
                messages.add_message(request, messages.INFO, "Génération de l'image de couverture en cours")
            except TooOldException:
                messages.add_message(request, messages.ERROR, "Projet trop vieux pour reconstruire les city")
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


@admin.action(description="Regénérer et renvoyer les diagnostics sélectionnés")
def resend_request(modeladmin, request, queryset):  # pylint: disable=unused-argument
    messages.info(
        request,
        f"Régénération et renvoit de {queryset.count()} demandes de diagnostics.",
    )
    for request in queryset:
        tasks.generate_word_diagnostic.apply_async((request.id,), link=tasks.send_word_diagnostic.s())


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    model = Request
    actions = [resend_request]
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
                    "organism",
                    "function",
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
    inlines = [ErrorTrackingAdmin]
    readonly_fields = (
        "requested_document",
        "first_name",
        "last_name",
        "function",
        "organism",
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
            link = reverse("project:home", args=[obj.project_id])
            return format_html(f'<a href="{link}">Accès à la fiche</a>')
        except exceptions.NoReverseMatch:
            return format_html("Diagnostic inconnu")

    link_to_project.short_description = "Projet public"  # type: ignore

    def link_to_project_admin(self, obj):
        try:
            link = reverse("admin:project_project_change", args=[obj.project_id])
            return format_html(f'<a href="{link}">Accès à la dans l\'admin</a>')
        except exceptions.NoReverseMatch:
            return format_html("Diagnostic inconnu")

    link_to_project.short_description = "Projet admin"  # type: ignore

    change_form_template = "project/admin/request_detail.html"

    def response_change(self, request, obj):
        if "_send-action" in request.POST:
            obj.done = False
            obj.sent_date = None
            obj.save()
            tasks.send_word_diagnostic.delay(obj.id)
            msg = "Envoie du diagnostic en cours"
            messages.add_message(request, messages.INFO, msg)
            return HttpResponseRedirect(".")
        elif "_generate-action" in request.POST:
            obj.sent_file.delete(save=True)
            tasks.generate_word_diagnostic.delay(obj.id)
            msg = "Génération du diagnostic en cours"
            messages.add_message(request, messages.INFO, msg)
            return HttpResponseRedirect(".")
        return super().response_change(request, obj)


@admin.register(RNUPackage)
class RNUPackageAdmin(admin.ModelAdmin):
    model = RNUPackage
    list_display = (
        "departement_official_id",
        "created_at",
        "updated_at",
    )
    search_fields = ("departement_official_id",)
    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(RNUPackageRequest)
class RNUPackageRequestAdmin(admin.ModelAdmin):
    model = RNUPackageRequest
    list_display = (
        "user",
        "rnu_package",
        "departement_official_id",
    )
    search_fields = ("email",)
