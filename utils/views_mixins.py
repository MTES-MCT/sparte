from django.urls import reverse_lazy


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
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
        ]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        breadcrumbs = self.get_context_breadcrumbs()
        breadcrumbs[-1]["is_active"] = True
        context.update({"breadcrumbs": breadcrumbs})
        return context
