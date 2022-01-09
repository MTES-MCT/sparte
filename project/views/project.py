from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView

from public_data.models import CouvertureSol, UsageSol

from project.forms import SelectCitiesForm, SelectPluForm, UploadShpForm
from project.models import Project
from project.domains import ConsommationDataframe

from utils.views_mixins import BreadCrumbMixin, GetObjectMixin

from .mixins import UserQuerysetOrPublicMixin


class GroupMixin(GetObjectMixin, UserQuerysetOrPublicMixin, BreadCrumbMixin):
    """Simple trick to not repeat myself. Pertinence to be evaluated."""

    queryset = Project.objects.all()
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:list"), "title": "Mes projets"},
        )
        try:
            project = self.get_object()
            breadcrumbs.append(
                {
                    "href": reverse_lazy("project:detail", kwargs={"pk": project.id}),
                    "title": project.name,
                }
            )
        except AttributeError:
            pass
        return breadcrumbs


class ProjectListView(GroupMixin, LoginRequiredMixin, ListView):
    template_name = "project/list.html"
    context_object_name = "projects"  # override to add an "s"

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(is_public=False)
        return qs


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


class ProjectReportConsoView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_consommation.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Rapport consommation"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        project = self.get_object()

        builder = ConsommationDataframe(project)
        df = builder.build()

        # table headers
        headers = [
            "Commune",
        ]
        for col in df.columns:
            if col.startswith("artif"):
                col = col.split("_")[-1]
            headers.append(col)

        # table content
        table_artif = []
        for city, row in df.iterrows():
            table_artif.append(
                {
                    "name": city,
                    "before": row[0],
                    "items": list(row[1:-2]),
                    "total": row[-2],
                    "progression": row[-1] * 100,
                }
            )

        total_surface = int(project.area * 100)
        pki_inital_surface = int(builder.get_global_intial())
        pki_final_surface = int(builder.get_global_final())
        pki_progression = int(builder.get_global_progression())
        pki_progression_percent = builder.get_global_progression_percent() * 100

        conso_10_years = project.get_bilan_conso()

        return {
            **super().get_context_data(**kwargs),
            "start_year": project.analyse_start_date,
            "end_year": project.analyse_end_date,
            "headers": headers,
            "table_artif": table_artif,
            "initial_surface": pki_inital_surface,
            "initial_percent": 100 * pki_inital_surface / total_surface,
            "final_surface": pki_final_surface,
            "final_percent": 100 * pki_final_surface / total_surface,
            "total_surface": total_surface,
            "pki_progression": pki_progression,
            "pki_progression_percent": pki_progression_percent,
            "active_page": "consommation",
            "conso_10_years": conso_10_years,
            "trajectoire_2030": conso_10_years / 2,
            "trajectoire_year": conso_10_years / 20,
        }


class RefCouverture:
    def __init__(self, couv, data, millesimes):
        self.couv = couv
        self.parent = couv.get_parent()
        self.name = f"{couv.code} {couv.label}"
        self.label_short = couv.label[:50]
        # see all the available millesime
        self.millesimes = millesimes
        # surface contains one entry per year (millesime)
        self.surface = dict()
        for year in self.millesimes:
            self.surface[year] = sum(
                [
                    v
                    for k, v in data[year]["couverture"].items()
                    if k.startswith(self.code_prefix)
                ]
            )

    @property
    def code(self):
        return self.couv.code

    @property
    def map_color(self):
        return self.couv.map_color

    @property
    def code_prefix(self):
        return self.couv.code_prefix

    @property
    def level(self):
        return self.couv.level

    @property
    def label(self):
        return self.couv.label

    def __getattr__(self, name):
        if name.startswith("get_surface_"):
            year = name.split("_")[-1]
            return self.surface[year]
        else:
            return getattr(self, name)


class ProjectReportCouvertureView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_couverture.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Rapport artificialisation"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        project = self.get_object()
        raw_data = project.couverture_usage
        millesimes = raw_data.keys()
        data_covers = []
        for couv in CouvertureSol.objects.all().order_by("code"):
            data_covers.append(
                RefCouverture(
                    couv,
                    raw_data,
                    millesimes,
                )
            )

        # PREP DATA FOR DRILL DOWN CHART
        # column_drill_down = {
        #     "top": [
        #         {"name": "CS1", "y": 10},
        #         {"name": "CS2", "y": 5},
        #     ],
        #     "CS1" : [
        #         {"name": "CS1.1", "y": 8},
        #         {"name": "CS1.2", "y": 2},
        #     ],
        # }
        column_drill_down = dict()
        for dc in data_covers:
            key = "top" if dc.parent is None else dc.parent.code
            if key not in column_drill_down:
                column_drill_down[key] = []
            column_drill_down[key].append(
                {
                    "name": dc.name,
                    "y_2015": dc.get_surface_2015,
                    "y_2018": dc.get_surface_2018,
                    "drilldown": dc.code,
                    "map_color": dc.map_color,
                }
            )

        return {
            **super().get_context_data(),
            "data_covers": data_covers,
            "millesimes": millesimes,
            "surface_territoire": project.area,
            "active_page": "couverture",
            "column_drill_down": column_drill_down,
        }


class ProjectReportUsageView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_usage.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Rapport usage"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        project = self.get_object()
        raw_data = project.couverture_usage
        millesimes = raw_data.keys()
        data_covers = []
        for usage in UsageSol.objects.all().order_by("code"):
            data_covers.append(
                {
                    "code": usage.code,
                    "code_prefix": usage.code_prefix,
                    "level": usage.level,
                    "parent": usage.get_parent(),
                    "label_short": usage.label[:50],
                    "label": usage.label,
                    "color": None,
                    "total_surface": dict(),
                    "map_color": usage.map_color,
                }
            )
        for year in millesimes:
            data = raw_data[year]["usage"]
            for i in range(len(data_covers)):
                key = f"total_surface_{year}"
                label = data_covers[i]["code_prefix"]
                value = sum([v for k, v in data.items() if k.startswith(label)])
                data_covers[i][key] = value
                data_covers[i]["total_surface"][year] = value

        return {
            **super().get_context_data(),
            "data_covers": data_covers,
            "millesimes": millesimes,
            "surface_territoire": project.area,
            "active_page": "usage",
        }


class ProjectReportSynthesisView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_synthesis.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {
                "href": None,
                "title": "Synthèse consommation d'espace et artificialisation",
            }
        )
        return breadcrumbs

    def get_context_data(self, **kwargs):
        context = super().get_context_data()
        project = self.get_object()
        total_surface = int(project.area * 100)
        conso_10_years = project.get_bilan_conso()
        context.update(
            {
                "active_page": "synthesis",
                "conso_10_years": conso_10_years,
                "trajectoire_2030": conso_10_years / 2,
                "total_surface": total_surface,
            }
        )
        # project = self.get_object()
        return context


class ProjectMapView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/full_carto.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Carte intéractive"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        # UPGRADE: add center and zoom fields on project model
        # values would be infered when emprise is loaded
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "breadcrumb": [
                    {"href": reverse_lazy("project:list"), "title": "Mes projets"},
                    {
                        "href": reverse_lazy(
                            "project:detail",
                            kwargs={
                                "pk": self.object.pk,
                            },
                        ),
                        "title": self.object.name,
                    },
                ]
            }
        )
        context.update(
            {
                # center map on France
                "carto_name": "Project",
                "center_lat": 44.6586,
                "center_lng": -1.164,
                "default_zoom": 12,
                "layer_list": [
                    {
                        "name": "Communes",
                        "url": reverse_lazy("public_data:communessybarval-list"),
                        "display": False,
                        "gradient_url": reverse_lazy(
                            "public_data:communessybarval-gradient"
                        ),
                        "level": "2",
                        "color_property_name": "d_brute_20",
                    },
                    {
                        "name": "Emprise du projet",
                        "url": reverse_lazy("project:emprise-list")
                        + f"?id={self.object.pk}",
                        "display": True,
                        "style": "style_emprise",
                        "fit_map": True,
                        "level": "5",
                    },
                    {
                        "name": "Artificialisation 2015 à 2018",
                        "url": reverse_lazy(
                            "public_data:artificialisee2015to2018-list"
                        ),
                        "display": True,
                        "gradient_url": reverse_lazy(
                            "public_data:artificialisee2015to2018-gradient"
                        ),
                        "level": "7",
                    },
                    {
                        "name": "Renaturation de 2018 à 2015",
                        "url": reverse_lazy("public_data:renaturee2018to2015-list"),
                        "gradient_url": reverse_lazy(
                            "public_data:renaturee2018to2015-gradient"
                        ),
                        "level": "7",
                        "display": True,
                    },
                    {
                        "name": "Zones artificielles",
                        "url": reverse_lazy("public_data:artificielle2018-list"),
                        "display": False,
                        "gradient_url": reverse_lazy(
                            "public_data:artificielle2018-gradient"
                        ),
                        "level": "3",
                        "style": "style_zone_artificielle",
                    },
                    {
                        "name": "OCSGE",
                        "url": reverse_lazy("public_data:ocsge-optimized"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                        "switch": "ocsge",
                    },
                ],
            }
        )
        return context


class ProjectCreateView(GroupMixin, LoginRequiredMixin, CreateView):
    model = Project
    template_name = "project/create.html"
    fields = ["name", "description", "analyse_start_date", "analyse_end_date"]

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Nouveau"})
        return breadcrumbs

    def form_valid(self, form):
        # required to set the user who is logged as creator
        form.instance.user = self.request.user
        response = super().form_valid(form)  # save the data in db
        return response

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs={"pk": self.object.id})


class ProjectUpdateView(GroupMixin, LoginRequiredMixin, UpdateView):
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


class ProjectReinitView(GroupMixin, LoginRequiredMixin, DeleteView):
    model = Project
    template_name = "project/reinit.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Réinitialiser"})
        return breadcrumbs

    def post(self, request, *args, **kwargs):
        # reset project
        self.get_object().reset(save=True)
        # redirect
        success_url = self.get_success_url()
        return HttpResponseRedirect(success_url)

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs=self.kwargs)
