from django.contrib import admin

from .models import ContactForm, Newsletter


@admin.register(ContactForm)
class ContactFormAdmin(admin.ModelAdmin):
    list_display = ("email", "status", "created_date")


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("email", "created_date", "confirmation_date")
