from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
from django.views.generic import DetailView, ListView, RedirectView

from project.models import Project
from project.models.enums import ProjectChangeReason

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
                (
                    "Vous pouvez retrouver ce diagnostic en cliquant sur le bouton 'Mon compte' "
                    "en haut à droite de la page, puis 'Mes diagnostics'."
                ),
            )
            project.user = request.user
            project._change_reason = ProjectChangeReason.USER_CLAIMED_PROJECT
            project.save()
        return super().get(request, *args, **kwargs)


class ProjectListView(GroupMixin, LoginRequiredMixin, ListView):
    template_name = "project/pages/list.html"
    context_object_name = "projects"  # override to add an "s"

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).prefetch_related("report_drafts")


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
