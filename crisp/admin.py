from django.contrib import admin

from .models import CrispWebhookNotification


@admin.register(CrispWebhookNotification)
class CrispNotificationAdmin(admin.ModelAdmin):
    model = CrispWebhookNotification
