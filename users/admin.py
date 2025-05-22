from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import User


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = (
        "email",
        "is_staff",
        "is_active",
        "proconnect",
    )
    list_filter = (
        "is_staff",
        "is_active",
    )
    readonly_fields = (
        "date_joined",
        "last_login",
    )
    fieldsets = (
        (
            None,
            {"fields": ("first_name", "last_name", "email", "organism", "function", "service", "siret", "proconnect")},
        ),
        (
            "Territoire principal d'intérêt",
            {"fields": ("main_land_type", "main_land_id")},
        ),
        (
            "Password",
            {"fields": ("password",)},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                )
            },
        ),
        (
            "Audit",
            {
                "fields": (
                    "date_joined",
                    "last_login",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                    "organism",
                    "function",
                    "service",
                    "siret",
                    "main_land_type",
                    "main_land_id",
                ),
            },
        ),
    )
    search_fields = ("email",)
    ordering = ("email",)


admin.site.register(User, CustomUserAdmin)
