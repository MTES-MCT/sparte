from django.contrib import messages
from django.contrib.gis import admin
from django.http import HttpResponseRedirect
from django.urls import exceptions, reverse
from django.utils.html import format_html
from simple_history.admin import SimpleHistoryAdmin

from . import tasks
from .models import ErrorTracking, Project, Request


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
    search_fields = (
        "name",
        "user__email",
    )
    # filter_horizontal = ("cities",)
    change_form_template = "project/admin/project_detail.html"
    history_list_display = [
        "async_city_and_combined_emprise_done",
        "async_cover_image_done",
        "async_find_first_and_last_ocsge_done",
        "async_add_neighboors_done",
        "async_generate_theme_map_conso_done",
        "async_generate_theme_map_artif_done",
        "async_theme_map_understand_artif_done",
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
        elif "_check-async" in request.POST:
            tasks.rerun_missing_async.delay(obj.id)
            msg = "Vérification complète de la construction du diagnostic en cours"
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
            link = reverse("project:detail", args=[obj.project_id])
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
