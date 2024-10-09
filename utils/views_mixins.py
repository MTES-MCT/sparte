from django.core.exceptions import ImproperlyConfigured
from django.shortcuts import resolve_url
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from fancy_cache import cache_page


class GetObjectMixin:
    """override get_object to cache returned object."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.object = None

    def get_object(self, queryset=None):
        if not self.object:
            self.object = super().get_object(queryset)
        return self.object


class BreadCrumbMixin:
    def get_context_breadcrumbs(self):
        return [{"href": reverse_lazy("home:home"), "title": "Accueil"}]

    def get_context_data(self, **kwargs):
        breadcrumbs = self.get_context_breadcrumbs()
        breadcrumbs[-1]["is_active"] = True
        kwargs.update({"breadcrumbs": breadcrumbs})
        return super().get_context_data(**kwargs)


class RedirectURLMixin:
    """En attendant Django 4"""

    next_page = None
    redirect_field_name = "next"

    def get_success_url(self):
        return self.get_redirect_url() or self.get_default_redirect_url()

    def get_redirect_url(self):
        """Return the user-originating redirect URL if it's safe."""
        redirect_to = self.request.POST.get(self.redirect_field_name, self.request.GET.get(self.redirect_field_name))
        return redirect_to if redirect_to else ""

    def get_default_redirect_url(self):
        """Return the default redirect URL."""
        if self.next_page:
            return resolve_url(self.next_page)
        raise ImproperlyConfigured("No URL to redirect to. Provide a next_page.")


class CacheMixin:
    cache_timeout = 60 * 15  # cache pour 15 minutes

    def should_cache(self, *args, **kwargs):
        """Override to disable cache conditionally"""
        return True

    def prefixer(self, request):
        if request.method != "GET" or request.GET.get("no-cache"):
            return None
        # Permet de bien séparer la mise en cache des pages complètes et des fragments chargés via React.
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return f"partial_{request.get_full_path()}"
        return f"full_{request.get_full_path()}"

    def cached_dispatch(self, request, *args, **kwargs):
        # Utiliser la méthode de classe pour le préfixe
        key_prefix = self.prefixer(request)
        return cache_page(self.cache_timeout, key_prefix=key_prefix)(super().dispatch)(request, *args, **kwargs)

    @method_decorator(
        cache_control(
            no_cache=True,
            max_age=0,
            no_store=True,
            must_revalidate=True,
        )
    )
    def dispatch(self, request, *args, **kwargs):
        if self.should_cache():
            return self.cached_dispatch(request, *args, **kwargs)
        return super().dispatch(request, *args, **kwargs)
