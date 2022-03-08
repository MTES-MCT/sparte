from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import TemplateView, FormView, RedirectView

from public_data.models import Epci, Departement, Region, Commune, Land
from utils.views_mixins import BreadCrumbMixin

from project.forms import EpciForm, DepartementForm, RegionForm, OptionsForm
from project.models import Project
from project.tasks import process_project


class SelectTypeView(BreadCrumbMixin, TemplateView):
    template_name = "project/create/choose_type_territoire.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic 1/2"},
        )
        return breadcrumbs


class SelectRegionView(BreadCrumbMixin, FormView):
    template_name = "project/create/select_region.html"
    form_class = RegionForm

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic 2/3"},
        )
        return breadcrumbs

    def form_valid(self, form):
        region = form.cleaned_data["region"]
        self.request.session["public_key"] = f"REGION_{region.id}"
        return redirect("project:select_2")


class SelectPublicProjects(BreadCrumbMixin, TemplateView):
    template_name = "project/create/select_1.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic 1/2"},
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
            if public_key:
                try:
                    request.session["public_key"] = public_key
                    return redirect("project:select_2")
                except Project.DoesNotExist:
                    messages.error(self.request, "Territoire non disponible.")
            else:
                messages.warning(self.request, "Merci de sélectionner un territoire.")
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)


class LandException(BaseException):
    pass


class SetProjectOptions(BreadCrumbMixin, FormView):
    template_name = "project/create/select_2.html"
    form_class = OptionsForm
    initial = {
        "analysis_start": "2011",
        "analysis_end": "2019",
    }

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic 2/2"},
        )
        return breadcrumbs

    def get_territoire(self):
        try:
            public_keys = self.request.session["public_key"]
        except (AttributeError, KeyError) as e:
            raise LandException("No territory available in session") from e
        if not isinstance(public_keys, list):
            public_keys = [public_keys]
        lands = list()
        for public_key in public_keys:
            type_territoire, id = public_key.split("_")
            if type_territoire == "EPCI":
                lands.append(Epci.objects.get(pk=int(id)))
            elif type_territoire == "DEPART":
                lands.append(Departement.objects.get(pk=int(id)))
            elif type_territoire == "REGION":
                lands.append(Region.objects.get(pk=int(id)))
            elif type_territoire == "COMMUNE":
                lands.append(Commune.objects.get(pk=int(id)))
        return lands

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        lands = self.get_territoire()
        millesimes = {year for land in lands for year in land.get_ocsge_millesimes()}
        millesimes = list(millesimes)
        millesimes.sort()
        is_artif_ready = True
        for land in lands:
            is_artif_ready &= land.is_artif_ready
        context.update(
            {
                "lands": lands,
                "analysis_artif": is_artif_ready,
                "millesimes": millesimes,
            }
        )
        return context

    def get(self, request, *args, **kwargs):
        """Catch exception if no land are in the session and redirect to step 1"""
        try:
            return self.render_to_response(self.get_context_data())
        except LandException:
            messages.error(
                self.request, "Le territoire n'a pas été correctement sélectionné."
            )
            return redirect("project:select")

    def form_valid(self, form):
        """If the form is valid, redirect to the supplied URL."""
        lands = self.get_territoire()
        if len(lands) == 1:
            name = f"Diagnostic de {lands[0].name}"
            emprise_origin = Project.EmpriseOrigin.WITH_EMPRISE
        else:
            name = "Diagnostic de plusieurs communes"
            emprise_origin = Project.EmpriseOrigin.FROM_CITIES
        project = Project(
            name=name,
            is_public=True,
            analyse_start_date=str(form.cleaned_data["analysis_start"]),
            analyse_end_date=str(form.cleaned_data["analysis_end"]),
            import_status=Project.Status.PENDING,
            emprise_origin=emprise_origin,
        )
        if self.request.user.is_authenticated:
            project.user = self.request.user
        project.save()
        if len(lands) == 1:
            project.emprise_set.create(mpoly=lands[0].mpoly)
        else:
            project.cities.add(*lands)
        process_project.delay(project.id)
        return redirect(project)


class SelectCities(BreadCrumbMixin, TemplateView):
    template_name = "project/create/select_1_city.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic 1/2"},
        )
        return breadcrumbs

    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        self.to_remove = self.request.GET.get("remove", None)
        self.to_add = self.request.GET.get("add", None)
        self.needle = self.request.GET.get("needle", None)
        self.public_keys = list()
        selected = self.request.GET.get("selected_cities", None)
        if selected:
            self.public_keys = [c.strip() for c in selected.split(";")]
        self.select = self.request.GET.get("select", None)

    def get(self, request, *args, **kwargs):
        # Remove a city selected
        if self.to_remove and self.to_remove in self.public_keys:
            i = self.public_keys.index(self.to_remove)
            self.public_keys.pop(i)
        # add a new city
        if self.to_add and self.to_add not in self.public_keys:
            city = Land(self.to_add)
            self.public_keys.append(city.public_key)
        # list city autocompleted
        if self.needle:
            autocomplete = [
                c
                for c in Commune.search(self.needle)
                if c.public_key not in self.public_keys
            ]
            kwargs.update(
                {
                    "autocomplete_cities": autocomplete,
                }
            )
        if self.select:
            request.session["public_key"] = self.public_keys
            return redirect("project:select_2")
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **context):
        selected_cities = [Land(pk) for pk in self.public_keys]
        selected_cities_url = f"selected_cities={';'.join(self.public_keys)}"
        context.update(
            {
                "selected_cities": selected_cities,
                "selected_cities_form": ";".join(self.public_keys),
                "selected_cities_url": selected_cities_url,
                "needle": self.needle,
            }
        )
        return super().get_context_data(**context)


class ClaimProjectView(LoginRequiredMixin, RedirectView):
    def get(self, request, *args, **kwargs):
        project = get_object_or_404(Project, pk=self.kwargs["pk"])
        self.url = project.get_absolute_url()
        if project.user is not None:
            messages.error(
                request, "Erreur : ce diagnostic est appartient déjà à quelqu'un"
            )
        else:
            messages.success(
                request,
                "Vous pouvez retrouver ce diagnostic en utilisant le menu Diagnostic > Ouvrir",
            )
            project.user = request.user
            project.save()
        return super().get(request, *args, **kwargs)
