from django.contrib import admin

from .models import FrequentlyAskedQuestion


@admin.register(FrequentlyAskedQuestion)
class FrequentlyAskedQuestionAdmin(admin.ModelAdmin):
    model = FrequentlyAskedQuestion
    list_display = ("title", "order")
    search_fields = (
        "title",
        "menu_entry",
        "md_content",
        "slug",
    )
    # ordering = ("title",)
    readonly_fields = ("slug",)
