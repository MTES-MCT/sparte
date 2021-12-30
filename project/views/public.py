from django.views.generic import TemplateView

from project.forms import EpciForm, DepartementForm, RegionForm
from public_data.models import Epci, Departement, Region


class SelectPublicProjects(TemplateView):
    template_name = "project/select.html"
    http_method_names = ["get", "post"]

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

    def post(self, request, *args, **kwargs):
        self.button_type = request.POST.get("button_type", None)
        self.region_id = request.POST.get("region", None)
        self.departement_id = request.POST.get("departement", None)
        self.epci_id = request.POST.get("epci", None)
        return self.get(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        if not self.region_id:
            self.region_id = request.GET.get("region_id", None)
        if not self.departement_id:
            self.departement_id = request.GET.get("departement_id", None)
        if not self.epci_id:
            self.epci_id = request.GET.get("epci_id", None)
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)
