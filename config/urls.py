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
from django.urls import include, path
from mozilla_django_oidc.urls import urlpatterns as oidc_urls
from two_factor.admin import AdminSiteOTPRequired
from two_factor.urls import urlpatterns as tf_urls
from two_factor.views import LoginView

from config.views import EnvironmentView, WebpackProxyView
from public_data.views import (
    PdfFooterView,
    PdfHeaderView,
    RapportCompletView,
    RapportDraftView,
)

admin.site.site_header = f"Mon Diagnostic Artificialisation v{settings.OFFICIAL_VERSION}"
if settings.TWO_FACTOR_ENABLED:
    admin.site.__class__ = AdminSiteOTPRequired

if settings.TWO_FACTOR_ENABLED:
    urlpatterns = [
        path("admin/login/", LoginView.as_view(), name="admin_login_2fa"),  # Forcer l'admin à utiliser 2FA
        path("", include(tf_urls)),  # URLs de two_factor
    ]
else:
    urlpatterns = []

urlpatterns += [
    path("admin/", admin.site.urls),
    path("", include("oidc.urls")),  # URLs OIDC custom pour ProConnect
    path("oidc/", include(oidc_urls)),  # URLs OIDC standard pour ProConnect
    path("", include("home.urls")),
    path("users/", include("users.urls")),
    path("public/", include("public_data.urls")),
    path("project/", include("project.urls")),
    path("api/", include("project.api_urls")),
    path("carte/", include("carto.urls")),
    path("fancy-cache", include("fancy_cache.urls")),
    path("crisp/", include("crisp.urls")),
    path(
        "exports/rapport-complet/<str:land_type>/<str:land_id>", RapportCompletView.as_view(), name="rapport_complet"
    ),
    path("exports/rapport-draft/<uuid:draft_id>", RapportDraftView.as_view(), name="rapport_draft"),
    path("exports/pdf-header", PdfHeaderView.as_view(), name="pdf_header"),
    path("exports/pdf-footer", PdfFooterView.as_view(), name="pdf_footer"),
    path("env", view=EnvironmentView.as_view(), name="env"),
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

    # Proxy webpack dev server pour le développement
    urlpatterns += [
        path("webpack-dev/<path:path>", WebpackProxyView.as_view(), name="webpack_proxy"),
    ]

    htmlcov_path = settings.BASE_DIR / "htmlcov"
    urlpatterns += static("/cov/", document_root=htmlcov_path)
