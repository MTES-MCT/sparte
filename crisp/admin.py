from django.contrib import admin

from .models import CrispWebhookNotification


@admin.register(CrispWebhookNotification)
class UsageSolAdmin(admin.ModelAdmin):
    model = CrispWebhookNotification
