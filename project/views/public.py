from django.contrib import messages
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView, FormView

from public_data.models import Epci, Departement, Region
from utils.views_mixins import BreadCrumbMixin

from project.forms import EpciForm, DepartementForm, RegionForm, OptionsForm
from project.models import Project
from project.tasks import process_project


class SelectPublicProjects(BreadCrumbMixin, TemplateView):
    template_name = "project/select_1.html"

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
        self.region_id = request.GET.get("region", None)
        self.departement_id = request.GET.get("departement", None)
        self.epci_id = request.GET.get("epci", None)
        if self.region_id:
            public_key = f"REGION_{self.region_id}"
        if self.departement_id:
            public_key = f"DEPART_{self.departement_id}"
        if self.epci_id:
            public_key = f"EPCI_{self.epci_id}"
        if request.GET.get("see_diagnostic", None):
            try:
                request.session["public_key"] = public_key
                return redirect("project:select_2")
            except Project.DoesNotExist:
                messages.error(self.request, "Territoire non disponible.")
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)


class SetProjectOptions(BreadCrumbMixin, FormView):
    template_name = "project/select_2.html"
    form_class = OptionsForm
    initial = {
        "analysis_start": "2011",
        "analysis_end": "2020",
    }

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic"},
        )
        return breadcrumbs

    def get_territoire(self):
        type_territoire, id = self.request.session["public_key"].split("_")
        if type_territoire == "EPCI":
            return Epci.objects.get(pk=int(id))
        elif type_territoire == "DEPART":
            return Departement.objects.get(pk=int(id))
        elif type_territoire == "REGION":
            return Region.objects.get(pk=int(id))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        land = self.get_territoire()
        context.update(
            {
                "land": land,
                "analysis_artif": land.is_artif_ready,
            }
        )
        return context

    def form_valid(self, form):
        """If the form is valid, redirect to the supplied URL."""
        land = self.get_territoire()
        project = Project(
            name=f"Diagnostic de {land.name}",
            is_public=True,
            analyse_start_date=str(form.cleaned_data["analysis_start"]),
            analyse_end_date=str(form.cleaned_data["analysis_end"]),
            import_status=Project.Status.PENDING,
            emprise_origin=Project.EmpriseOrigin.WITH_EMPRISE,
        )
        project.save()
        project.emprise_set.create(mpoly=land.mpoly)
        process_project.delay(project.id)
        return redirect(project)
