from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse_lazy, reverse
from django.views.generic import (
    ListView,
    DetailView,
    CreateView,
    DeleteView,
    UpdateView,
)

from django_app_parameter import app_parameter

from public_data.models import CouvertureSol, UsageSol, Land

from project.charts import (
    ConsoCommuneChart,
    DeterminantPerYearChart,
    DeterminantPieChart,
    ConsoComparisonChart,
)
from project.forms import UploadShpForm, KeywordForm
from project.models import Project, Request, ProjectCommune
from project.domains import ConsommationDataframe
from project.tasks import send_email_request_bilan

from utils.views_mixins import BreadCrumbMixin, GetObjectMixin

from .mixins import UserQuerysetOrPublicMixin


class GroupMixin(GetObjectMixin, UserQuerysetOrPublicMixin, BreadCrumbMixin):
    """Simple trick to not repeat myself. Pertinence to be evaluated."""

    queryset = Project.objects.all()
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"href": reverse_lazy("project:list"), "title": "Mes diagnostics"},
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
        qs = Project.objects.filter(user=self.request.user)
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
    template_name = "project/detail_pending.html"


class ProjectSuccessView(GroupMixin, DetailView):
    template_name = "project/detail_success.html"

    def get_context_data(self, **kwargs):
        kwargs["claim_diagnostic"] = self.object.user is None
        return super().get_context_data(**kwargs)


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
        headers = ["Commune"]
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

        target_2031_consumption = project.get_bilan_conso()
        current_conso = project.get_bilan_conso_time_scoped()

        # communes_data_graph
        chart_conso_cities = ConsoCommuneChart(project)
        communes_data_table = dict()
        total = dict()
        for city, data in chart_conso_cities.get_series().items():
            communes_data_table[city] = data.copy()
            communes_data_table[city]["total"] = sum(data.values())
            for year, val in data.items():
                total[year] = total.get(year, 0) + val
        total["total"] = sum(total.values())
        communes_data_table["Total"] = total

        # Liste des groupes de communes
        groups_names = project.projectcommune_set.all().order_by("group_name")
        groups_names = groups_names.exclude(group_name=None).distinct()
        groups_names = groups_names.values_list("group_name", flat=True)

        # Déterminants
        det_chart = DeterminantPerYearChart(project)

        # check conso relative required or not
        relative_required = self.request.GET.get("relative", "false")
        if relative_required == "true":
            relative = True
        else:
            relative = False
        comparison_chart = ConsoComparisonChart(project, relative=relative)

        return {
            **super().get_context_data(**kwargs),
            "total_surface": project.area,
            "active_page": "consommation",
            "communes_data_table": communes_data_table,
            "target_2031": {
                "consummed": target_2031_consumption,
                "annual_avg": target_2031_consumption / 10,
                "target": target_2031_consumption / 2,
                "annual_forecast": target_2031_consumption / 20,
            },
            "project_scope": {
                "consummed": current_conso,
                "annual_avg": current_conso / project.nb_years,
                "nb_years": project.nb_years,
                "nb_years_before_31": project.nb_years_before_2031,
                "forecast_2031": project.nb_years_before_2031
                * current_conso
                / project.nb_years,
            },
            # charts
            "determinant_per_year_chart": det_chart,
            "determinant_pie_chart": DeterminantPieChart(
                project, series=det_chart.get_series()
            ),
            "comparison_chart": comparison_chart,
            "relative": relative,
            "commune_chart": chart_conso_cities,
            # tables
            "data_determinant": det_chart.get_series(),
            "groups_names": groups_names,
        }


class ProjectReportCityGroupView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/report_city_group.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        project = self.get_object()
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {
                "href": reverse("project:report_conso", args=[project.id]),
                "title": "Rapport consommation",
            },
            {
                "href": None,
                "title": "Zoom groupes de villes",
            },
        ]
        return breadcrumbs

    def get_context_data(self, **kwargs):
        project = self.get_object()
        group_name = self.request.GET.get("group_name", None)
        if not group_name:
            qs = ProjectCommune.objects.filter(project=project)
            qs = qs.exclude(group_name=None).order_by("group_name").distinct()
            qs = qs.values_list("group_name", flat=True)
            group_name = qs.first()
        # retrieve groups of cities
        city_group_list = project.city_group_list

        def city_without_group(city_group_list):
            """Return cities without group (group_name==None)"""
            for city_group in city_group_list:
                if city_group.name is None:
                    return city_group.cities

        def groups_with_name(city_group_list):
            """Return named group (exclude cities with group_name == None)"""
            return [
                city_group
                for city_group in city_group_list
                if city_group.name is not None
            ]

        def groups_name(group):
            return set(_.name for _ in group if _.name is not None)

        # Consommation des communes
        chart_conso_cities = ConsoCommuneChart(project, group_name=group_name)
        communes_table = dict()
        for city_name, data in chart_conso_cities.get_series().items():
            data.update({"Total": sum(data.values())})
            communes_table[city_name] = data

        # Déterminants
        det_chart = DeterminantPerYearChart(project, group_name=group_name)

        kwargs = {
            "active_page": "consommation",
            "group_name": group_name,
            "project": project,
            "groups_name": groups_name(city_group_list),
            "city_group_list": groups_with_name(city_group_list),
            "city_without_group": city_without_group(city_group_list),
            # Charts
            "chart_conso_cities": chart_conso_cities,
            "determinant_per_year_chart": det_chart,
            "determinant_pie_chart": DeterminantPieChart(
                project, group_name=group_name, series=det_chart.get_series()
            ),
            # Tables
            "communes_data_table": communes_table,
            "data_determinant": det_chart.get_series(),
        }
        return super().get_context_data(**kwargs)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        groups = {
            v1: [v2 for k2, v2 in request.POST.items() if k2.startswith(v1)]
            for k1, v1 in request.POST.items()
            if k1.startswith("group_name_")
        }
        base_qs = ProjectCommune.objects.filter(project=self.object)
        base_qs.update(group_name=None)
        for group_name, city_names in groups.items():
            qs = base_qs.filter(commune__name__in=city_names)
            if not group_name:
                group_name = "sans_nom"
            qs.update(group_name=group_name)
        context = self.get_context_data(object=self.object)
        return self.render_to_response(context)


class RefCouverture:
    def __init__(self, couv, data, millesimes, type_data="couverture"):
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
                    for k, v in data[year][type_data].items()
                    if k.startswith(self.code_prefix)
                ]
            )

    @property
    def code(self):
        return self.couv.code

    @property
    def evolution(self):
        try:
            val = list(self.surface.values())
            return val[1] - val[0]
        except (KeyError, IndexError):
            return 0

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
            try:
                return self.surface[year]
            except KeyError:
                return 0
        else:
            return getattr(self, name)


class ProjectReportCouvertureView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_couverture.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Rapport couverture du sol"})
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
        # column_drill_down = dict()
        # for dc in data_covers:
        #     key = "top" if dc.parent is None else dc.parent.code
        #     if key not in column_drill_down:
        #         column_drill_down[key] = []
        #     column_drill_down[key].append(
        #         {
        #             "name": dc.name,
        #             "y_2015": dc.get_surface_2015,
        #             "y_2018": dc.get_surface_2018,
        #             "drilldown": dc.code,
        #             "map_color": dc.map_color,
        #         }
        #     )

        return {
            **super().get_context_data(),
            "data_covers": data_covers,
            "millesimes": millesimes,
            "surface_territoire": project.area,
            "active_page": "couverture",
            # "column_drill_down": column_drill_down,
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
                RefCouverture(
                    usage,
                    raw_data,
                    millesimes,
                    type_data="usage",
                )
            )

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


class ProjectReportArtifView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/rapport_artif.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {
                "href": None,
                "title": "Rapport artificialisation",
            }
        )
        return breadcrumbs

    def get_context_data(self, **kwargs):
        context = super().get_context_data()
        project = self.get_object()
        total_surface = project.area
        context.update(
            {
                "active_page": "artificialisation",
                "total_surface": total_surface,
            }
        )
        return context


class ProjectReportDownloadView(GroupMixin, CreateView):
    model = Request
    template_name = "project/rapport_download.html"
    fields = [
        "first_name",
        "last_name",
        "function",
        "organism",
        "email",
    ]

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {
                "href": None,
                "title": "Téléchargement du bilan",
            }
        )
        return breadcrumbs

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update(
            {
                "project": self.get_object(),
                "url_bilan": app_parameter.BILAN_EXAMPLE,
            }
        )
        return context

    def get_initial(self):
        """Return the initial data to use for forms on this view."""
        initial = self.initial.copy()
        if self.request.user and not self.request.user.is_anonymous:
            initial.update(
                {
                    "first_name": self.request.user.first_name,
                    "last_name": self.request.user.last_name,
                    "function": self.request.user.function,
                    "organism": self.request.user.organism,
                    "email": self.request.user.email,
                }
            )
        return initial

    def form_valid(self, form):
        # required to set the user who is logged as creator
        if self.request.user.is_authenticated:
            form.instance.user = self.request.user
        form.instance.project = self.get_object()
        self.object = form.save()
        send_email_request_bilan.delay(self.object.id)
        messages.success(
            self.request,
            (
                "Votre demande de bilan a été enregistrée, un e-mail de confirmation "
                "vous a été envoyé."
            ),
        )
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return self.object.project.get_absolute_url()


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
                    {"href": reverse_lazy("project:list"), "title": "Mes diagnostics"},
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
                        # "url": reverse_lazy("public_data:commune-list"),
                        "url": reverse_lazy(
                            "project:project-communes", args=[self.object.id]
                        ),
                        "display": False,
                        "level": "2",
                        # "color_property_name": "map_color",
                        "style": "style_communes",
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
                        "name": "Archachon : artificialisation 2015 à 2018",
                        "url": reverse_lazy(
                            "public_data:artificialisee2015to2018-list"
                        ),
                        "display": False,
                        "gradient_url": reverse_lazy(
                            "public_data:artificialisee2015to2018-gradient"
                        ),
                        "level": "7",
                    },
                    {
                        "name": "Arcachon : renaturation de 2015 à 2018",
                        "url": reverse_lazy("public_data:renaturee2018to2015-list"),
                        "gradient_url": reverse_lazy(
                            "public_data:renaturee2018to2015-gradient"
                        ),
                        "level": "7",
                        "display": False,
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
                    {
                        "name": "Gers: Couverture 2016",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2016&color=couverture"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Couverture 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2019&color=couverture"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Usage 2016",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2016&color=usage"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Usage 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2019&color=usage"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: différence 2016 à 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2016&year_new=2019"
                        ),
                        "display": False,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Gers: zones construites 2016",
                        "url": (
                            f'{reverse_lazy("public_data:zoneconstruite-optimized")}'
                            "?year=2016"
                        ),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                    {
                        "name": "Gers: zones construites 2019",
                        "url": (
                            f'{reverse_lazy("public_data:zoneconstruite-optimized")}'
                            "?year=2019"
                        ),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
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
