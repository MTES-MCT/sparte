from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse_lazy, reverse
from django.views.generic import (
    ListView,
    DetailView,
    DeleteView,
    UpdateView,
)

from public_data.models import Land

from project.forms import UploadShpForm, KeywordForm
from project.models import Project
from .mixins import GroupMixin


class ProjectUpdateView(GroupMixin, UpdateView):
    model = Project
    template_name = "project/update.html"
    fields = ["name", "description", "analyse_start_date", "analyse_end_date"]
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Editer"})
        return breadcrumbs

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs=self.kwargs)


class ProjectDeleteView(GroupMixin, LoginRequiredMixin, DeleteView):
    model = Project
    template_name = "project/delete.html"
    success_url = reverse_lazy("project:list")

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Supprimer"})
        return breadcrumbs


class ProjectAddLookALike(GroupMixin, DetailView):
    model = Project
    template_name = "project/add_look_a_like.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
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
                page_from = self.request.GET.get("from", None)
                if page_from == "conso_report":
                    url = reverse("project:report_conso", kwargs={"pk": project.id})
                    return redirect(f"{url}#territoires-de-comparaison")
                else:
                    return redirect(project)
            except Exception:
                return super().get(request, *args, **kwargs)
        rm_public_key = request.GET.get("remove", None)
        if rm_public_key:
            project.remove_look_a_like(rm_public_key)
            project.save()
            return redirect(project)
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
            context["results"] = Land.search(needle)
        return self.render_to_response(context)


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
