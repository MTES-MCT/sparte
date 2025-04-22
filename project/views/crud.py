import celery
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse
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
from project.forms import KeywordForm, SelectTerritoryForm, UpdateProjectForm
from project.models import Project, create_from_public_key
from project.models.enums import ProjectChangeReason
from public_data.exceptions import LandException
from public_data.models import Land
from utils.views_mixins import BreadCrumbMixin, RedirectURLMixin

from .mixins import GroupMixin, ReactMixin


class ClaimProjectView(LoginRequiredMixin, RedirectView):
    def get(self, request, *args, **kwargs):
        project = get_object_or_404(Project, pk=self.kwargs["pk"])
        self.url = project.get_absolute_url()
        if project.user is not None:
            messages.error(request, "Erreur : ce diagnostic est appartient déjà à quelqu'un")
        else:
            messages.success(
                request,
                (
                    "Vous pouvez retrouver ce diagnostic en cliquant sur le bouton 'Mon compte' "
                    "en haut à droite de la page, puis 'Mes diagnostics'."
                ),
            )
            project.user = request.user
            project._change_reason = ProjectChangeReason.USER_CLAIMED_PROJECT
            project.save()
        return super().get(request, *args, **kwargs)


class CreateProjectViews(BreadCrumbMixin, FormView):
    template_name = "project/pages/advanced_search.html"
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
        project = create_from_public_key(form.cleaned_data["selection"], user=self.request.user)

        if self.request.GET.get("next") == "download":
            return redirect("project:report_download", pk=project.id)
        else:
            return redirect("project:home", pk=project.id)


class ProjectUpdateView(ReactMixin, UpdateView):
    model = Project
    partial_template_name = "project/components/dashboard/update.html"
    full_template_name = "project/pages/update.html"
    form_class = UpdateProjectForm
    context_object_name = "project"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
                "project_id": project.id,
            }
        )
        return super().get_context_data(**kwargs)

    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        from metabase.tasks import async_create_stat_for_project

        self.object = form.save()

        celery.chain(
            celery.group(
                tasks.generate_theme_map_conso.si(self.object.id),
            ),
            async_create_stat_for_project.si(self.object.id, do_location=False),
        ).apply_async()

        return redirect("project:home", pk=self.object.id)


class ProjectSetTarget2031View(UpdateView):
    model = Project
    template_name = "project/components/forms/report_set_target_2031.html"
    fields = ["target_2031"]
    context_object_name = "diagnostic"

    def form_valid(self, form):
        self.object = form.save()
        return self.render_to_response(
            self.get_context_data(success_message=True),
            headers={"HX-Trigger": "load-graphic"},
        )


class ProjectDeleteView(GroupMixin, LoginRequiredMixin, DeleteView):
    model = Project
    template_name = "project/pages/delete.html"
    success_url = reverse_lazy("project:list")

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Supprimer"})
        return breadcrumbs


class ProjectAddLookALike(GroupMixin, RedirectURLMixin, FormMixin, DetailView):
    model = Project
    template_name = "project/components/forms/add_territoire_de_comparaison.html"
    context_object_name = "project"
    form_class = KeywordForm

    def form_valid(self, form):
        """If the form is valid, redirect to the supplied URL."""
        kwargs = {"results": Land.search(form.cleaned_data["keyword"], search_for="*"), "form": form}
        return self.render_to_response(self.get_context_data(**kwargs))

    def post(self, request, *args, **kwargs):
        add_public_key = request.POST.get("add", None)
        project = self.get_object()
        if add_public_key:
            try:
                land = Land(add_public_key)
                project.add_look_a_like(land.public_key)
                project._change_reason = ProjectChangeReason.USER_ADDED_A_LOOK_A_LIKE
                project.save(update_fields=["look_a_like"])

                response = HttpResponse(status=204)
                response["HX-Trigger"] = "force-refresh"  # Déclenche l'événement 'force-refresh'
                return response
            except LandException:
                pass

        form = self.get_form()
        if form.is_valid():
            return self.form_valid(form)
        else:
            return self.form_invalid(form)


class ProjectRemoveLookALike(DetailView):
    """Supprime un territoire de comparaison du projet."""

    model = Project

    def post(self, request, *args, **kwargs):
        project = self.get_object()

        public_key = request.POST.get("public_key")

        project.remove_look_a_like(public_key)
        project._change_reason = ProjectChangeReason.USER_REMOVED_A_LOOK_A_LIKE
        project.save(update_fields=["look_a_like"])

        response = HttpResponse(status=204)
        # Ajoute un en-tête HTMX personnalisé pour forcer le rechargement du composant React Consommation.tsx
        response["HX-Trigger"] = "force-refresh"
        return response


class ProjectListView(GroupMixin, LoginRequiredMixin, ListView):
    template_name = "project/pages/list.html"
    context_object_name = "projects"  # override to add an "s"

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)


class SplashScreenView(GroupMixin, DetailView):
    model = Project
    template_name = "project/pages/splash_screen.html"
    context_object_name = "diagnostic"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"href": None, "title": "Création du diagnostic"},
        ]
        return breadcrumbs


class SplashProgressionView(GroupMixin, DetailView):
    model = Project
    template_name = "project/components/widgets/fragment_splash_progress.html"
    context_object_name = "diagnostic"

    def dispatch(self, *args, **kwargs):
        response = super().dispatch(*args, **kwargs)
        if self.object.is_ready_to_be_displayed:
            response["HX-Redirect"] = reverse("project:home", kwargs=self.kwargs)
        return response

    def get_context_data(self, **kwargs):
        kwargs["last_update"] = timezone.now()
        return super().get_context_data(**kwargs)
