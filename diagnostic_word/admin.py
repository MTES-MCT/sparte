from django.contrib import admin

from diagnostic_word.models import WordTemplate


@admin.register(WordTemplate)
class WordTemplateAdmin(admin.ModelAdmin):
    list_display = ("slug", "last_update", "docx", "description")
