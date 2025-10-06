from django.urls import reverse_lazy


class BreadCrumbMixin:
    def get_context_breadcrumbs(self):
        return [{"href": reverse_lazy("home:home"), "title": "Accueil"}]

    def get_context_data(self, **kwargs):
        breadcrumbs = self.get_context_breadcrumbs()
        breadcrumbs[-1]["is_active"] = True
        kwargs.update({"breadcrumbs": breadcrumbs})
        return super().get_context_data(**kwargs)
