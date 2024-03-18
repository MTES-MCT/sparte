from django.conf import settings
from rest_framework import permissions


class HasCrispValidKey(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return request.query_params.get("key") == settings.CRISP_WEBHOOK_SECRET_KEY
