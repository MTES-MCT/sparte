from django.contrib import messages
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView

from project.forms import EpciForm, DepartementForm, RegionForm
from project.models import Project
from public_data.models import Epci, Departement, Region
from utils.views_mixins import BreadCrumbMixin


class SelectPublicProjects(BreadCrumbMixin, TemplateView):
    template_name = "project/select.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic"},
        )
        return breadcrumbs

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.departement_id = None
        self.region_id = None
        self.epci_id = None

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.epci_id:
            dep = Departement.objects.get(pk=self.departement_id)
            epci = Epci.objects.get(pk=self.epci_id)
            context.update(
                {
                    "region": dep.region,
                    "region_id": dep.region.id,
                    "departement": dep,
                    "epci": epci,
                }
            )
        elif self.departement_id:
            dep = Departement.objects.get(pk=self.departement_id)
            context.update(
                {
                    "region": dep.region,
                    "region_id": dep.region.id,
                    "departement": dep,
                    "epci_form": EpciForm(departement_id=dep.id),
                }
            )
        elif self.region_id:
            region = Region.objects.get(pk=self.region_id)
            context.update(
                {
                    "region": region,
                    "region_id": region.id,
                    "departement_form": DepartementForm(region_id=self.region_id),
                }
            )
        else:
            context.update(
                {
                    "region_form": RegionForm(),
                }
            )
        return context

    def get(self, request, *args, **kwargs):
        public_key = None
        if not self.region_id:
            self.region_id = request.GET.get("region", None)
            public_key = f"REGION_{self.region_id}"
        if not self.departement_id:
            self.departement_id = request.GET.get("departement", None)
            public_key = f"DEPART_{self.departement_id}"
        if not self.epci_id:
            self.epci_id = request.GET.get("epci", None)
            public_key = f"EPCI_{self.epci_id}"
        if request.GET.get("see_diagnostic", None):
            try:
                project = Project.objects.get(public_key=public_key)
                return redirect(project)
            except Project.DoesNotExist:
                messages.error(self.request, "Territoire non disponible.")
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)
