from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from home.models import ContactForm, Newsletter, PageFeedback


@admin.register(ContactForm)
class ContactFormAdmin(admin.ModelAdmin):
    list_display = ("email", "status", "created_date")


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("email", "created_date", "confirmation_date")


@admin.register(PageFeedback)
class PageFeedbackAdmin(admin.ModelAdmin):
    list_display = ("rating", "land_name", "land_type", "page_name", "user_link", "created_at")
    list_filter = ("rating", "page_name", "land_type", "created_at")
    search_fields = ("land_name", "land_id", "page_url", "comment", "user__email")
    readonly_fields = ("created_at", "user_link", "territory_link")

    @admin.display(description="Utilisateur")
    def user_link(self, obj):
        if not obj.user:
            return "—"
        url = reverse("admin:users_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)

    @admin.display(description="Territoire")
    def territory_link(self, obj):
        if not obj.land_type or not obj.land_id:
            return "—"
        return format_html(
            '<a href="{}" target="_blank">{} ({})</a>',
            obj.page_url,
            obj.land_name or obj.land_id,
            obj.land_type,
        )
