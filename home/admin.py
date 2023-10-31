from django.contrib import admin

from home.models import AliveTimeStamp, ContactForm, Newsletter


@admin.register(ContactForm)
class ContactFormAdmin(admin.ModelAdmin):
    list_display = ("email", "status", "created_date")


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("email", "created_date", "confirmation_date")


@admin.register(AliveTimeStamp)
class AliveTimeStampAdmin(admin.ModelAdmin):
    list_display = ("queue_name", "timestamp")
    list_filter = ("queue_name",)
