import celery
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.views.generic import (
    DeleteView,
    DetailView,
    FormView,
    ListView,
    RedirectView,
    UpdateView,
)
from django.views.generic.edit import FormMixin

from project import tasks
from project.forms import KeywordForm, SelectTerritoryForm, UpdateProjectForm, UpdateProjectPeriodForm
from project.models import Project, create_from_public_key
from public_data.models import AdminRef, Land, LandException
from utils.views_mixins import BreadCrumbMixin, RedirectURLMixin

from .mixins import GroupMixin


class ClaimProjectView(LoginRequiredMixin, RedirectView):
    def get(self, request, *args, **kwargs):
        project = get_object_or_404(Project, pk=self.kwargs["pk"])
        self.url = project.get_absolute_url()
        if project.user is not None:
            messages.error(request, "Erreur : ce diagnostic est appartient déjà à quelqu'un")
        else:
            messages.success(
                request,
                "Vous pouvez retrouver ce diagnostic en utilisant le menu Diagnostic > Ouvrir",
            )
            project.user = request.user
            project._change_reason = "Claim"
            project.save()
        return super().get(request, *args, **kwargs)


class CreateProjectViews(BreadCrumbMixin, FormView):
    template_name = "project/create/select_3.html"
    form_class = SelectTerritoryForm

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"title": "Nouveau diagnostic"},
        )
        return breadcrumbs

    def get_context_data(self, **kwargs):
        kwargs.update({"next": self.request.GET.get("next", "")})
        return super().get_context_data(**kwargs)

    def form_valid(self, form):
        """If the form is valid, redirect to the supplied URL."""
        if not form.cleaned_data["selection"]:
            search_for = []
            if form.cleaned_data["search_region"]:
                search_for.append(AdminRef.REGION)
            if form.cleaned_data["search_departement"]:
                search_for.append(AdminRef.DEPARTEMENT)
            if form.cleaned_data["search_epci"]:
                search_for.append(AdminRef.EPCI)
            if form.cleaned_data["search_commune"]:
                search_for.append(AdminRef.COMMUNE)
            if form.cleaned_data["search_scot"]:
                search_for.append(AdminRef.SCOT)
            needle = form.cleaned_data["keyword"]
            if needle == "*":
                needle = ""
            results = Land.search(
                needle,
                region=form.cleaned_data["region"],
                departement=form.cleaned_data["departement"],
                epci=form.cleaned_data["epci"],
                search_for=search_for,
            )
            kwargs = {
                "results": {AdminRef.get_label(k): v for k, v in results.items()},
                "form": form,
            }
            return self.render_to_response(self.get_context_data(**kwargs))
        else:
            project = create_from_public_key(form.cleaned_data["selection"], user=self.request.user)

            if self.request.GET.get("next") == "download":
                return redirect("project:report_download", pk=project.id)
            else:
                return redirect("project:splash", pk=project.id)


class ProjectUpdateView(GroupMixin, UpdateView):
    model = Project
    template_name = "project/update.html"
    form_class = UpdateProjectForm
    context_object_name = "project"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
                "active_page": "update",
            }
        )
        return super().get_context_data(**kwargs)

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Editer"})
        return breadcrumbs

    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        from metabase.tasks import async_create_stat_for_project

        self.object = form.save()

        celery.chain(
            tasks.find_first_and_last_ocsge.si(self.object.id),
            tasks.calculate_project_ocsge_status.si(self.object.id),
            celery.group(
                tasks.generate_theme_map_conso.si(self.object.id),
                tasks.generate_theme_map_artif.si(self.object.id),
                tasks.generate_theme_map_understand_artif.si(self.object.id),
            ),
            async_create_stat_for_project.si(self.object.id, do_location=False),
        ).apply_async()

        return redirect("project:splash", pk=self.object.id)


class SetProjectPeriodView(GroupMixin, RedirectURLMixin, UpdateView):
    model = Project
    template_name = "project/partials/report_set_period.html"
    form_class = UpdateProjectPeriodForm

    def get_context_data(self, **kwargs):
        project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
                "next": self.request.build_absolute_uri(reverse_lazy("project:splash", kwargs={'pk':self.object.id})),
            }
        )
        return super().get_context_data(**kwargs)
                   
    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        from metabase.tasks import async_create_stat_for_project

        self.object = form.save()

        celery.chain(
            tasks.find_first_and_last_ocsge.si(self.object.id),
            tasks.calculate_project_ocsge_status.si(self.object.id),
            celery.group(
                tasks.generate_theme_map_conso.si(self.object.id),
                tasks.generate_theme_map_artif.si(self.object.id),
                tasks.generate_theme_map_understand_artif.si(self.object.id),
            ),
            async_create_stat_for_project.si(self.object.id, do_location=False),
        ).apply_async()

        return self.render_to_response(
                self.get_context_data(success_message=True),
                # headers={"HX-Redirect": reverse_lazy("project:splash", pk=self.object.id)},
            )


class ProjectDeleteView(GroupMixin, LoginRequiredMixin, DeleteView):
    model = Project
    template_name = "project/delete.html"
    success_url = reverse_lazy("project:list")

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Supprimer"})
        return breadcrumbs


class ProjectAddLookALike(GroupMixin, RedirectURLMixin, FormMixin, DetailView):
    model = Project
    template_name = "project/add_look_a_like.html"
    context_object_name = "project"
    form_class = KeywordForm

    def get_success_url(self):
        """Add anchor to url if provided in GET parameters."""
        anchor = self.request.GET.get("anchor", None)
        if anchor:
            return f"{super().get_success_url()}#{anchor}"
        return super().get_success_url()

    def form_valid(self, form):
        """If the form is valid, redirect to the supplied URL."""
        kwargs = {"results": Land.search(form.cleaned_data["keyword"], search_for="*")}
        return self.render_to_response(self.get_context_data(**kwargs))

    def get(self, request, *args, **kwargs):
        add_public_key = request.GET.get("add", None)
        project = self.get_object()
        if add_public_key:
            try:
                # if public_key does not exist should raise an exception
                land = Land(add_public_key)
                # use land.public_key to avoid injection
                project.add_look_a_like(land.public_key)
                project._change_reason = "add look a like"
                project.save(update_fields=["look_a_like"])
                return HttpResponseRedirect(self.get_success_url())
            except LandException:
                pass
        return super().get(request, *args, **kwargs)

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {
                "href": reverse_lazy("project:update", kwargs=self.kwargs),
                "title": "Paramètres",
            },
            {"href": None, "title": "Ajouter un territoire de comparaison"},
        ]
        return breadcrumbs

    def get_context_data(self, **kwargs):
        kwargs["next"] = self.request.GET.get("next", None)
        kwargs["anchor"] = self.request.GET.get("anchor", None)
        return super().get_context_data(**kwargs)

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests: instantiate a form instance with the passed
        POST variables and then check if it's valid.
        """
        form = self.get_form()
        if form.is_valid():
            return self.form_valid(form)
        else:
            return self.form_invalid(form)


class ProjectRemoveLookALike(GroupMixin, RedirectURLMixin, DetailView):
    """Remove a look a like from the project.

    Providing a next page in the url parameter is required.
    """

    model = Project

    def get_success_url(self):
        """Add anchor to url if provided in GET parameters."""
        anchor = self.request.GET.get("anchor", None)
        if anchor:
            return f"{super().get_success_url()}#{anchor}"
        return super().get_success_url()

    def get(self, request, *args, **kwargs):
        project = self.get_object()
        public_key = self.kwargs["public_key"]
        project.remove_look_a_like(public_key)
        project._change_reason = "Remove look a like"
        project.save(update_fields=["look_a_like"])
        return HttpResponseRedirect(self.get_success_url())


class ProjectListView(GroupMixin, LoginRequiredMixin, ListView):
    template_name = "project/list.html"
    context_object_name = "projects"  # override to add an "s"

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)


class SplashScreenView(GroupMixin, DetailView):
    model = Project
    template_name = "project/create/splash_screen.html"
    context_object_name = "diagnostic"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"href": None, "title": "Création du diagnostic"},
        ]
        return breadcrumbs


class SplashProgressionView(GroupMixin, DetailView):
    model = Project
    template_name = "project/create/fragment_splash_progress.html"
    context_object_name = "diagnostic"

    def dispatch(self, *args, **kwargs):
        response = super().dispatch(*args, **kwargs)
        if (
            self.object.async_add_city_done
            and self.object.async_set_combined_emprise_done
            and self.object.async_add_neighboors_done
            and self.object.async_find_first_and_last_ocsge_done
        ):
            response["HX-Redirect"] = reverse("project:detail", kwargs=self.kwargs)
        return response

    def get_context_data(self, **kwargs):
        kwargs["last_update"] = timezone.now()
        return super().get_context_data(**kwargs)
