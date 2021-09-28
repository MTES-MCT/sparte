from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView

from public_data.models import CouvertureSol

from project.forms import SelectCitiesForm, SelectPluForm, UploadShpForm
from project.models import Project

from .mixins import GetObjectMixin, UserQuerysetOnlyMixin


class GroupMixin(GetObjectMixin, LoginRequiredMixin, UserQuerysetOnlyMixin):
    """Simple trick to not repeat myself. Pertinence to be evaluated."""

    queryset = Project.objects.all()
    context_object_name = "project"


class ProjectListView(GroupMixin, ListView):
    template_name = "project/list.html"
    context_object_name = "projects"  # override to add an "s"


class ProjectDetailView(GroupMixin, DetailView):
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
    template_name = "project/detail_add_shp.html"

    def form_valid(self):
        id = self.get_object().id
        url = reverse_lazy("project:detail", kwargs={"pk": id})
        return HttpResponseRedirect(url)

    def get_forms(self):
        if self.request.method in ("POST", "PUT"):
            return {
                "city_form": SelectCitiesForm(self.request.POST),
                "plu_form": SelectPluForm(self.request.POST),
                "shp_form": UploadShpForm(self.request.POST, self.request.FILES),
            }
        else:
            return {
                "city_form": SelectCitiesForm(),
                "plu_form": SelectPluForm(),
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
    template_name = "project/detail_pending.html"


class ProjectSuccessView(GroupMixin, DetailView):
    template_name = "project/detail_success.html"


class ProjectFailedView(GroupMixin, DetailView):
    template_name = "project/detail_failed.html"


class ProjectReportView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_consommation.html"
    context_object_name = "project"

    def get_context_data(self, **kwargs):
        super_context = super().get_context_data(**kwargs)
        table_artif = []
        table_percent = []
        pki_2009_ha = pki_2018_ha = 0
        total_surface = 0
        for city in self.object.cities.all():
            pki_2009_ha += city.artif_before_2009
            pki_2018_ha += city.total_artif()
            total_surface += city.surface

            items = list(city.list_artif())
            table_artif.append(
                {
                    "name": city.name,
                    "before": items.pop(0),
                    "items": items,
                    "total": city.total_artif(),
                    "surface": city.surface,
                }
            )
            items = list(city.list_percent())
            table_percent.append(
                {
                    "name": city.name,
                    "before": items.pop(0),
                    "items": items,
                    "total": f"{city.total_percent():.2%}",
                    "surface": city.surface,
                }
            )
        pki_2009_percent = pki_2009_ha / total_surface if total_surface else 0
        pki_2018_percent = pki_2018_ha / total_surface if total_surface else 0
        return {
            **super_context,
            "table_artif": table_artif,
            "table_percent": table_percent,
            "2009_ha": pki_2009_ha,
            "2009_percent": f"{pki_2009_percent:.2%}",
            "2018_ha": pki_2018_ha,
            "2018_percent": f"{pki_2018_percent:.2%}",
            "total_surface": total_surface,
        }


class ProjectReportArtifView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_artificialisation.html"
    context_object_name = "project"

    def get_context_data(self, **kwargs):
        project = self.get_object()
        raw_data = project.couverture_usage
        millesimes = raw_data.keys()
        data_covers = []
        for couv in CouvertureSol.iter_total_surface(raw_data):
            data_covers.append(
                {
                    "code": couv.code,
                    "level": couv.level,
                    "parent": couv.get_parent(),
                    "label_short": couv.label[:50],
                    "label": couv.label,
                    "color": None,
                    # Remarque du développeur:
                    # j'ai mis 2 moyens d'accéder à la données ci-dessous
                    # on verra ce qui est le plus facile dans le template
                    **{
                        f"total_surface_{year}": couv.total_surface[year]
                        for year in millesimes
                    },
                    "total_surface": {
                        year: couv.total_surface[year] for year in millesimes
                    },
                }
            )

        return {
            **super().get_context_data(),
            "data_covers": data_covers,
            "millesimes": millesimes,
            "surface_territoire": project.area,
        }


class ProjectMapView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/full_carto.html"
    context_object_name = "project"

    def get_context_data(self, **kwargs):
        context1 = super().get_context_data(**kwargs)
        # UPGRADE: add center and zoom fields on project model
        # values would be infered when emprise is loaded
        context2 = {
            # center map on France
            "carto_name": "Arcachon",
            "center_lat": 44.6586,
            "center_lng": -1.164,
            "default_zoom": 12,
            "layer_list": [
                {
                    "name": "Communes SYBARVAL",
                    "url": reverse_lazy("public_data:communessybarval-list"),
                    "immediate_display": False,
                    "gradient_url": reverse_lazy(
                        "public_data:communessybarval-gradient"
                    ),
                },
                {
                    "name": "Emprise du projet",
                    "url": reverse_lazy("project:emprise-list")
                    + f"?project_id={self.object.pk}",
                    "immediate_display": True,
                    "gradient_url": reverse_lazy("project:emprise-gradient"),
                },
                {
                    "name": "Artificialisation 2015 à 2018",
                    "url": reverse_lazy("public_data:artificialisee2015to2018-list"),
                    "immediate_display": True,
                    "gradient_url": reverse_lazy(
                        "public_data:artificialisee2015to2018-gradient"
                    ),
                },
                {
                    "name": "Renaturation de 2018 à 2015",
                    "url": reverse_lazy("public_data:renaturee2018to2015-list"),
                    "gradient_url": reverse_lazy(
                        "public_data:renaturee2018to2015-gradient"
                    ),
                },
                # {
                #     "name": "Zones Baties 2018",
                #     "url": reverse_lazy("public_data:zonesbaties2018-list"),
                #     "immediate_display": False,
                #     "gradient_url": reverse_lazy(
                #         "public_data:zonesbaties2018-gradient"
                #     ),
                # },
                {
                    "name": "Zones artificielles",
                    "url": reverse_lazy("public_data:artificielle2018-list"),
                    "immediate_display": False,
                    "gradient_url": reverse_lazy(
                        "public_data:artificielle2018-gradient"
                    ),
                },
            ],
        }
        return {**context1, **context2}


class ProjectCreateView(GroupMixin, CreateView):
    model = Project
    template_name = "project/create.html"
    fields = ["name", "description", "analyse_start_date", "analyse_end_date"]

    def form_valid(self, form):
        # required to set the user who is logged as creator
        form.instance.user = self.request.user
        response = super().form_valid(form)  # save the data in db
        return response

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs={"pk": self.object.id})


class ProjectUpdateView(GroupMixin, UpdateView):
    model = Project
    template_name = "project/update.html"
    fields = ["name", "description", "analyse_start_date", "analyse_end_date"]
    context_object_name = "project"

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs=self.kwargs)


class ProjectDeleteView(GroupMixin, DeleteView):
    model = Project
    template_name = "project/delete.html"
    success_url = reverse_lazy("project:list")


class ProjectReinitView(GroupMixin, DeleteView):
    model = Project
    template_name = "project/reinit.html"

    def post(self, request, *args, **kwargs):
        # reset project
        self.get_object().reset(save=True)
        # redirect
        success_url = self.get_success_url()
        return HttpResponseRedirect(success_url)

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs=self.kwargs)
