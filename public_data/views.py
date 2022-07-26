from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import TemplateView

from utils.views_mixins import BreadCrumbMixin

from .models import CouvertureUsageMatrix, UsageSol, CouvertureSol


class DisplayMatrix(LoginRequiredMixin, BreadCrumbMixin, TemplateView):
    template_name = "public_data/us_cs_matrix.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {
                "href": reverse_lazy("public_data:matrix"),
                "title": "Matrice d'occupation",
            },
        )
        return breadcrumbs

    def get_context_data(self, **kwargs):
        couvertures = CouvertureSol.get_leafs()
        usages = UsageSol.get_leafs()
        qs = CouvertureUsageMatrix.objects.filter(
            couverture__in=couvertures, usage__in=usages
        ).order_by("usage__code", "couverture__code")
        qs = qs.select_related("usage", "couverture")
        kwargs = dict()
        for item in qs:
            label = f"matrix_{item.usage.code}".replace(".", "_")
            if label not in kwargs:
                kwargs[label] = dict()
            kwargs[label][item.couverture.code] = item
        return super().get_context_data(**kwargs)
