from django.contrib import admin

from diagnostic_word.models import WordTemplate


@admin.register(WordTemplate)
class WordTemplateAdmin(admin.ModelAdmin):
    list_display = ("slug", "last_update", "docx", "description")
    readonly_fields = ("slug", "last_update")

    def has_add_permission(self, request, obj=None):
        """Only super user can add new word template"""
        return request.user.is_superuser
