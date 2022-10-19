"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, include


def trigger_error(request):
    """Snippet to test Sentry integration"""
    division_by_zero = 1 / 0  # # noqa: F841


admin.site.site_header = f"SPARTE administration v{settings.OFFICIAL_VERSION}"


urlpatterns = [
    path("boom/", trigger_error),
    path("", include("home.urls")),
    path("admin/", admin.site.urls),
    path("users/", include("users.urls")),
    path("public/", include("public_data.urls")),
    path("project/", include("project.urls")),
    path("carte/", include("carto.urls")),
    # use django's default views to handle password reseting process
    path(
        "accounts/reset/", auth_views.PasswordResetView.as_view(), name="password_reset"
    ),
    path(
        "accounts/reset/sent/",
        auth_views.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    path(
        "accounts/reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "accounts/reset/done/",
        auth_views.PasswordResetCompleteView.as_view(),
        name="password_reset_complete",
    ),
    path("docx/", include("django_docx_template.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    try:
        # try except required to activate debug in staging server
        # where we do not install dev dependencies
        import debug_toolbar  # noqa: E402

        urlpatterns += [
            path("__debug__/", include(debug_toolbar.urls)),
        ]
    except ImportError:
        pass

    path = settings.BASE_DIR / "htmlcov"
    urlpatterns += static("/cov/", document_root=path)
