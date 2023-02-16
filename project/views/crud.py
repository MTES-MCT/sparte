import celery
from django.contrib.auth.mixins import LoginRequiredMixin

from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import DeleteView, DetailView, ListView, UpdateView
from django.views.generic.edit import FormMixin

from project import tasks
from project.forms import KeywordForm, UploadShpForm, UpdateProjectForm
from project.models import Project
from public_data.models import Land, LandException

from utils.views_mixins import RedirectURLMixin
from .mixins import GroupMixin


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
        self.object = form.save()
        celery.chain(
            # check that ocsge period is still between project period
            tasks.find_first_and_last_ocsge.si(self.object.id),
            celery.group(
                tasks.generate_theme_map_conso.si(self.object.id),
                tasks.generate_theme_map_artif.si(self.object.id),
                tasks.generate_theme_map_understand_artif.si(self.object.id),
            ),
        ).apply_async()
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        if "next" in self.request.GET:
            if self.request.GET["next"] == "report-target-2031":
                return reverse_lazy("project:report_target_2031", kwargs=self.kwargs)
        return reverse_lazy("project:update", kwargs=self.kwargs)


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
                project.save()
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
        project.save()
        return HttpResponseRedirect(self.get_success_url())


class ProjectListView(GroupMixin, LoginRequiredMixin, ListView):
    queryset = Project.objects.all()
    template_name = "project/list.html"
    context_object_name = "projects"  # override to add an "s"

    def get_queryset(self):
        qs = Project.objects.filter(user=self.request.user)
        for project in qs:
            if project.cover_image:
                try:
                    project.prop_width = 266
                    project.prop_height = (
                        project.cover_image.height * 266 / project.cover_image.width
                    )
                except FileNotFoundError:
                    project.cover_image = None
        return qs
