from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, get_object_or_404
from django.views.generic import FormView, RedirectView

from public_data.models import Land, AdminRef
from utils.views_mixins import BreadCrumbMixin

from project.forms import SelectTerritoryForm
from project.models import Project, create_from_public_key


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
            results = Land.search(form.cleaned_data["keyword"])
            kwargs = {
                "results": {AdminRef.get_label(k): v for k, v in results.items()},
                "form": form,
            }
            return self.render_to_response(self.get_context_data(**kwargs))
        else:
            project = create_from_public_key(
                form.cleaned_data["selection"], user=self.request.user
            )

            if self.request.GET.get("next") == "download":
                return redirect("project:report_download", pk=project.id)
            else:
                return redirect(project)
