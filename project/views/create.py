from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

# from django.contrib.gis.db.models import Union
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import TemplateView, FormView, RedirectView

from public_data.models import (
    Epci,
    Departement,
    Region,
    Commune,
    Land,
    LandException,
    AdminRef,
)
from utils.db import fix_poly
from utils.views_mixins import BreadCrumbMixin

from project.forms import (
    EpciForm,
    DepartementForm,
    RegionForm,
    OptionsForm,
    KeywordForm,
)
from project.models import Project

# from project.tasks import process_project


class SelectTypeView(BreadCrumbMixin, TemplateView):
    template_name = "project/create/choose_type_territoire.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:create-1"), "title": "Nouveau diagnostic"},
        )
        return breadcrumbs


class SelectTerritoireView(BreadCrumbMixin, FormView):
    template_name = "project/create/select_territoire.html"
    form_class = KeywordForm

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"href": reverse_lazy("project:create-1"), "title": "Nouveau diagnostic"},
            {
                "href": reverse_lazy("project:create-dpt"),
                "title": "Choisir un territoire",
            },
        ]
        return breadcrumbs

    def get_context_data(self, **kwargs):
        kwargs["feminin"] = ""
        land_type = self.kwargs["land_type"].upper()
        if land_type == "EPCI":
            kwargs["land_label"] = "EPCI"
        elif land_type == "DEPARTEMENT":
            kwargs["land_label"] = "département"
        elif land_type == "COMMUNE":
            kwargs["land_label"] = "commune"
            kwargs["feminin"] = "e"
        else:
            kwargs["land_label"] = "région"
            kwargs["feminin"] = "e"
        return super().get_context_data(**kwargs)

    def post(self, request, *args, **kwargs):
        land_type = self.kwargs["land_type"].upper()
        keyword = request.POST.get("keyword", None)
        public_key = request.POST.get("land", None)
        context = {"keyword": keyword, "land_type": land_type}
        if keyword:
            if land_type == "EPCI":
                context["object_list"] = Epci.objects.filter(name__icontains=keyword)
            elif land_type == "DEPARTEMENT":
                context["object_list"] = Departement.objects.filter(
                    name__icontains=keyword
                )
            elif land_type == "COMMUNE":
                context["object_list"] = Commune.objects.filter(name__icontains=keyword)
            else:
                context["object_list"] = Region.objects.filter(name__icontains=keyword)
        if public_key:
            Land(public_key)
            return redirect("project:create-3", public_keys=public_key)
        return self.render_to_response(self.get_context_data(**context))


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
                    return redirect("project:create-3", public_keys=public_key)
                except Project.DoesNotExist:
                    messages.error(self.request, "Territoire non disponible.")
            else:
                messages.warning(self.request, "Merci de sélectionner un territoire.")
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)

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


class SetProjectOptions(BreadCrumbMixin, FormView):
    template_name = "project/create/select_2.html"
    form_class = OptionsForm
    initial = {"public_keys": ""}

    def get_initial(self):
        """Return the initial data to use for forms on this view."""
        kwargs = self.initial.copy()
        kwargs.update({"public_keys": self.kwargs["public_keys"]})
        return kwargs

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:select"), "title": "Mon diagnostic 2/2"},
        )
        return breadcrumbs

    def get_context_data(self, **kwargs):
        try:
            public_keys = self.kwargs["public_keys"].split("-")
        except KeyError as e:
            raise LandException("No territory available") from e
        lands = Land.get_lands(public_keys)
        millesimes = {year for land in lands for year in land.get_ocsge_millesimes()}
        millesimes = list(millesimes)
        millesimes.sort()
        is_artif_ready = True
        for land in lands:
            is_artif_ready &= land.is_artif_ready
        kwargs.update(
            {
                "lands": lands,
                "analysis_artif": is_artif_ready,
                "millesimes": millesimes,
            }
        )
        return super().get_context_data(**kwargs)

    def get(self, request, *args, **kwargs):
        """Catch exception if no land is available then redirect to step 1"""
        try:
            return self.render_to_response(self.get_context_data())
        except LandException:
            messages.error(
                self.request, "Le territoire n'a pas été correctement sélectionné."
            )
            return redirect("project:select")

    def form_valid(self, form):
        """If the form is valid, redirect to the supplied URL."""
        public_keys = form.cleaned_data["public_keys"].split("-")
        lands = Land.get_lands(public_keys)

        name = "Diagnostic de plusieurs communes"
        if len(lands) == 1:
            name = f"Diagnostic de {lands[0].name}"

        nb_types = len({type(land) for land in lands})
        land_type = AdminRef.COMPOSITE if nb_types > 1 else lands[0].land_type

        project = Project(
            name=name,
            is_public=True,
            analyse_start_date=str(form.cleaned_data["analysis_start"]),
            analyse_end_date=str(form.cleaned_data["analysis_end"]),
            level=form.cleaned_data["analysis_level"],
            import_status=Project.Status.SUCCESS,
            emprise_origin=Project.EmpriseOrigin.WITH_EMPRISE,
            land_ids=",".join(str(land.id) for land in lands),
            land_type=land_type,
        )
        if self.request.user.is_authenticated:
            project.user = self.request.user
        project.save()

        combined_emprise = None
        for land in lands:
            project.cities.add(*land.get_cities())
            if not combined_emprise:
                combined_emprise = land.mpoly
            else:
                combined_emprise = land.mpoly.union(combined_emprise)

        project.emprise_set.create(mpoly=fix_poly(combined_emprise))

        result = project.get_first_last_millesime()
        project.first_year_ocsge = result["first"]
        project.last_year_ocsge = result["last"]

        if project.land_type and project.land_type != AdminRef.COMPOSITE:
            public_keys = [_.public_key for _ in project.get_neighbors()]
            if len(public_keys) <= 8:
                project.add_look_a_like(public_keys, many=True)

        project.set_success(save=True)

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
            param = "-".join(self.public_keys)
            return redirect("project:create-3", public_keys=param)
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **context):
        selected_cities = []
        for pk in self.public_keys:
            try:
                selected_cities.append(Land(pk))
            except LandException:
                messages.error(self.request, "Erreur de sélection d'une commune")
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
