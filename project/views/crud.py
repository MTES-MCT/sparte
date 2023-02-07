import celery
from django.contrib.auth.mixins import LoginRequiredMixin

from django.http import HttpResponseRedirect
from django.urls import reverse, reverse_lazy
from django.views.generic import DeleteView, DetailView, ListView, UpdateView

from project import tasks
from project.forms import KeywordForm, UploadShpForm, UpdateProjectForm
from project.models import Project
from public_data.models import Land

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


class ProjectAddLookALike(GroupMixin, RedirectURLMixin, DetailView):
    model = Project
    template_name = "project/add_look_a_like.html"
    context_object_name = "project"

    def get_default_redirect_url(self):
        """Return the default redirect URL."""
        return reverse("project:lookalike", kwargs=self.kwargs)

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {
                "href": reverse_lazy("project:update", kwargs=self.kwargs),
                "title": "Paramètres",
            }
        )
        breadcrumbs.append(
            {"href": None, "title": "Ajouter un territoire de comparaison"}
        )
        return breadcrumbs

    def get_form(self):
        if self.request.method in ("POST", "PUT"):
            return KeywordForm(data=self.request.POST)
        else:
            return KeywordForm()

    def get_context_data(self, **kwargs):
        if "form" not in kwargs:
            kwargs["form"] = self.get_form()
        if "from" in self.request.GET:
            kwargs["from"] = f"from={self.request.GET['from']}"
        return super().get_context_data(**kwargs)

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
                return self.get_success_url()
            except Exception:
                return super().get(request, *args, **kwargs)
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests: instantiate a form instance with the passed
        POST variables and then check if it's valid.
        """
        self.object = self.get_object()
        form = self.get_form()
        context = self.get_context_data(form=form)
        if form.is_valid():
            needle = form.cleaned_data["keyword"]
            context["results"] = Land.search(needle, search_for="*")
        return self.render_to_response(context)


class ProjectRemoveLookALike(GroupMixin, RedirectURLMixin, DetailView):
    """Remove a look a like from the project.

    Providing a next page in the url parameter is required.
    """

    model = Project

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


class ProjectDetailView(GroupMixin, DetailView):
    queryset = Project.objects.all()

    def dispatch(self, request, *args, **kwargs):
        """
        Use the correct view according to Project status (kind of router)
        * MISSING => display a page to get the emprise from the user
        * PENDING => display a waiting message, calculation in progress
        * SUCCESS => display available option (report, pdf, carto...)
        * FAILED => display error message and advize to reload the emprise

        1. fetch project instance from DB
        2. according to import_status value build view callable
        3. error cases check (view is still None)
        4. call view rendering with request object

        RQ: this seems to be subefficient because object will be loaded several
        time, two views have to be initialized.... Probably a better pattern
        exists.
        """
        view = None
        project = self.get_object()  # step 1

        # step 2. normal cases
        if project.import_status == Project.Status.MISSING:
            view = ProjectNoShpView.as_view()
        elif project.import_status == Project.Status.PENDING:
            view = ProjectPendingView.as_view()
        elif project.import_status == Project.Status.SUCCESS:
            view = ProjectSuccessView.as_view()
        elif project.import_status == Project.Status.FAILED:
            view = ProjectFailedView.as_view()

        # step 3. error management
        if not view:
            if not project.import_status:
                # TODO add message that status is Null
                pass
            else:
                # TODO add a message with unkown status
                pass
            # send on missing emprise
            view = ProjectNoShpView.as_view()

        # step 4. render correct view according to import_status
        return view(request, *args, **kwargs)


class ProjectNoShpView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/detail_add_shp.html"

    def form_valid(self):
        id = self.get_object().id
        url = reverse_lazy("project:detail", kwargs={"pk": id})
        return HttpResponseRedirect(url)

    def get_forms(self):
        if self.request.method in ("POST", "PUT"):
            return {
                "shp_form": UploadShpForm(self.request.POST, self.request.FILES),
            }
        else:
            return {
                "shp_form": UploadShpForm(),
            }

    def get_context_data(self, **kwargs):
        context = self.get_forms()
        return super().get_context_data(**context)

    def post(self, request, *args, **kwargs):
        for form in self.get_forms().values():
            if form.is_valid():
                form.save(project=self.get_object())
                # one form was valid, let's got to success url
                return self.form_valid()
        # no forms are valid, display them again
        return self.get(request, *args, **kwargs)


class ProjectPendingView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/detail_pending.html"


class ProjectSuccessView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/detail_success.html"

    def get_context_data(self, **kwargs):
        kwargs["claim_diagnostic"] = self.object.user is None
        kwargs["analysis_artif"] = self.object.is_artif
        return super().get_context_data(**kwargs)


class ProjectFailedView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/detail_failed.html"
