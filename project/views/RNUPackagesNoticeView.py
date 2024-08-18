from typing import Any

from django.db.models.query import QuerySet
from django.views.generic import DetailView, TemplateView

from project.models import RNUPackage


class RNUPackagesNoticeView(TemplateView, DetailView):
    template_name = "project/rnu_package_notice.html"
    breadcrumbs_title = "__"
    pk_url_kwarg = "departement_official_id"
    model = RNUPackage

    def get_object(self) -> QuerySet[Any]:
        departement_official_id = self.kwargs.get("departement_official_id")
        return RNUPackage.objects.get(departement_official_id=departement_official_id)

    def get_context_data(self, **kwargs):
        data: RNUPackage = self.get_object()
        return {
            "object": data,
            "communes": data.communes,
        }
