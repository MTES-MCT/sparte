from decimal import InvalidOperation
from typing import Any, Dict

from django.contrib import messages
from django.contrib.gis.db.models.functions import Area
from django.contrib.gis.geos import Polygon
from django.db import transaction
from django.db.models import Case, CharField, DecimalField, F, Q, Sum, Value, When
from django.db.models.functions import Cast, Concat
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.views.generic import CreateView, DetailView, TemplateView

from project import charts, tasks
from project.models import Project, ProjectCommune, Request
from project.utils import add_total_line_column
from public_data.models import CouvertureSol, UsageSol
from public_data.models.gpu import ZoneUrba
from public_data.models.ocsge import Ocsge, OcsgeDiff
from utils.htmx import StandAloneMixin

from .mixins import BreadCrumbMixin, GroupMixin, UserQuerysetOrPublicMixin


class ProjectReportBaseView(GroupMixin, DetailView):
    breadcrumbs_title = "To be set"
    context_object_name = "project"
    queryset = Project.objects.all()

    @transaction.non_atomic_requests
    def dispatch(self, request, *args, **kwargs):
        # with this, be careful when doing row modification, autocommit is disabled
        return super().dispatch(request, *args, **kwargs)

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": self.breadcrumbs_title})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        kwargs["ocsge_available"] = self.object.is_artif
        return super().get_context_data(**kwargs)


class ProjectReportConsoView(ProjectReportBaseView):
    template_name = "project/report_consommation.html"
    breadcrumbs_title = "Rapport consommation"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        # Retrieve request level of analysis
        level = self.request.GET.get("level_conso", project.level)

        # communes_data_graph
        chart_conso_cities = charts.ConsoCommuneChart(project, level=level)

        target_2031_consumption = project.get_bilan_conso()
        current_conso = project.get_bilan_conso_time_scoped()

        # Déterminants
        det_chart = charts.DeterminantPerYearChart(project)

        # objectives
        objective_chart = charts.ObjectiveChart(project)

        # Liste des groupes de communes
        groups_names = project.projectcommune_set.all().order_by("group_name")
        groups_names = groups_names.exclude(group_name=None).distinct()
        groups_names = groups_names.values_list("group_name", flat=True)

        comparison_chart = charts.ConsoComparisonChart(project, relative=False)

        kwargs.update(
            {
                "diagnostic": project,
                "total_surface": project.area,
                "land_type": project.land_type or "COMP",
                "active_page": "consommation",
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
                    "forecast_2031": project.nb_years_before_2031 * current_conso / project.nb_years,
                },
                # charts
                "determinant_per_year_chart": det_chart,
                "determinant_pie_chart": charts.DeterminantPieChart(project, series=det_chart.get_series()),
                "comparison_chart": comparison_chart,
                "commune_chart": chart_conso_cities,
                # tables
                "communes_data_table": add_total_line_column(chart_conso_cities.get_series()),
                "data_determinant": add_total_line_column(det_chart.get_series()),
                "groups_names": groups_names,
                "level": level,
                "objective_chart": objective_chart,
                "nb_communes": project.cities.count(),
            }
        )

        return super().get_context_data(**kwargs)


class ProjectReportCityGroupView(ProjectReportBaseView):
    template_name = "project/report_city_group.html"
    breadcrumbs_title = "Zoom groupes de villes"

    def get_context_breadcrumbs(self):
        project = self.get_object()
        breadcrumbs = super().get_context_breadcrumbs()
        crumb = {
            "href": reverse("project:report_conso", args=[project.id]),
            "title": "Rapport consommation",
        }
        breadcrumbs.insert(-1, crumb)
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
            return [city_group for city_group in city_group_list if city_group.name is not None]

        def groups_name(group):
            return set(_.name for _ in group if _.name is not None)

        # Consommation des communes
        chart_conso_cities = charts.ConsoCommuneChart(project, group_name=group_name)
        communes_table = dict()
        for city_name, data in chart_conso_cities.get_series().items():
            data.update({"Total": sum(data.values())})
            communes_table[city_name] = data

        # Déterminants
        det_chart = charts.DeterminantPerYearChart(project, group_name=group_name)

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
            "determinant_pie_chart": charts.DeterminantPieChart(
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


class ProjectReportDicoverOcsgeView(ProjectReportBaseView):
    template_name = "project/report_discover_ocsge.html"
    breadcrumbs_title = "Rapport découvrir l'OCS GE"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        surface_territory = project.area
        kwargs = {
            "diagnostic": project,
            "nom": "Rapport découvrir l'OCS GE",
            "surface_territory": surface_territory,
            "active_page": "discover",
        }

        if not project.is_artif:
            return super().get_context_data(**kwargs)

        kwargs.update(
            {
                "first_millesime": str(project.first_year_ocsge),
                "last_millesime": str(project.last_year_ocsge),
                "couv_pie_chart": charts.CouvertureSolPieChart(project),
                "couv_progression_chart": charts.CouvertureSolProgressionChart(project),
                "usa_pie_chart": charts.UsageSolPieChart(project),
                "usa_progression_chart": charts.UsageSolProgressionChart(project),
                "usa_leafs": UsageSol.get_leafs(),
                "usage_nomenclature": {item.code_prefix_class: item for item in UsageSol.get_usage_nomenclature()},
                "couv_leafs": CouvertureSol.get_leafs(),
                "couv_nomenclature": {item.code_prefix_class: item for item in CouvertureSol.get_couv_nomenclature()},
            }
        )

        # Couverture

        couv_matrix_data = project.get_matrix(sol="couverture")
        if couv_matrix_data:
            kwargs.update(
                {
                    "couv_matrix_data": add_total_line_column(couv_matrix_data),
                    "couv_matrix_headers": list(couv_matrix_data.values())[0].keys(),
                    "couv_wheel_chart": charts.CouvWheelChart(project),
                }
            )

        # Usage

        usa_matrix_data = project.get_matrix(sol="usage")
        if usa_matrix_data:
            kwargs.update(
                {
                    "usa_matrix_data": add_total_line_column(usa_matrix_data),
                    "usa_matrix_headers": list(usa_matrix_data.values())[0].keys(),
                    "usa_whell_chart": charts.UsageWheelChart(project),
                }
            )

        return super().get_context_data(**kwargs)


class ProjectReportUsageView(ProjectReportBaseView):
    template_name = "project/report_usage.html"
    breadcrumbs_title = "Rapport sur l'usage des sols"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        surface_territory = project.area
        kwargs = {
            "nom": "Usage",
            "surface_territory": surface_territory,
            "active_page": "usage",
        }

        if not project.is_artif:
            return super().get_context_data(**kwargs)

        first_millesime = project.first_year_ocsge
        last_millesime = project.last_year_ocsge

        pie_chart = charts.UsageSolPieChart(project)
        progression_chart = charts.UsageSolProgressionChart(project)
        kwargs.update(
            {
                "first_millesime": str(first_millesime),
                "last_millesime": str(last_millesime),
                "pie_chart": pie_chart,
                "progression_chart": progression_chart,
            }
        )

        matrix_data = project.get_matrix(sol="usage")
        if matrix_data:
            kwargs.update(
                {
                    "matrix_data": add_total_line_column(matrix_data),
                    "matrix_headers": list(matrix_data.values())[0].keys(),
                }
            )

        return super().get_context_data(**kwargs)


class ProjectReportSynthesisView(ProjectReportBaseView):
    template_name = "project/report_synthesis.html"
    breadcrumbs_title = "Synthèse consommation d'espaces et artificialisation"

    def get_context_data(self, **kwargs):
        project = self.get_object()
        total_surface = int(project.area * 100)
        progression_time_scoped = project.get_artif_progession_time_scoped()
        objective_chart = charts.ObjectiveChart(project)
        curent_conso = project.get_bilan_conso_time_scoped()
        kwargs.update(
            {
                "diagnostic": project,
                "active_page": "synthesis",
                "total_surface": total_surface,
                "new_artif": progression_time_scoped["new_artif"],
                "new_natural": progression_time_scoped["new_natural"],
                "net_artif": progression_time_scoped["net_artif"],
                "objective_chart": objective_chart,
                "current_conso": curent_conso,
                "year_avg_conso": curent_conso / project.nb_years,
                "first_millesime": str(project.first_year_ocsge),
                "last_millesime": str(project.last_year_ocsge),
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportArtifView(ProjectReportBaseView):
    template_name = "project/report_artif.html"
    breadcrumbs_title = "Rapport artificialisation"

    def get_context_data(self, **kwargs):
        project = self.get_object()
        total_surface = project.area

        # Retrieve request level of analysis
        level = self.request.GET.get("level_conso", project.level)

        kwargs = {
            "land_type": project.land_type or "COMP",
            "diagnostic": project,
            "active_page": "artificialisation",
            "total_surface": total_surface,
        }

        if not project.is_artif:
            return super().get_context_data(**kwargs)

        first_millesime = project.first_year_ocsge
        last_millesime = project.last_year_ocsge

        artif_area = project.get_artif_area()
        rate_artif_area = round(100 * float(artif_area) / float(total_surface))

        chart_evolution_artif = charts.EvolutionArtifChart(project)
        chart_waterfall = charts.WaterfallnArtifChart(project)

        progression_time_scoped = chart_waterfall.get_series()
        net_artif = progression_time_scoped["net_artif"]

        try:
            net_artif_rate = 100 * net_artif / (artif_area - net_artif)
            # show + on front of net_artif
            net_artif = f"+{net_artif}" if net_artif > 0 else str(net_artif)
        except (TypeError, InvalidOperation):
            net_artif_rate = 0
            net_artif = "0"

        table_evolution_artif = chart_evolution_artif.get_series()
        headers_evolution_artif = table_evolution_artif["Artificialisation"].keys()

        chart_comparison = charts.NetArtifComparaisonChart(project, level=level)

        detail_couv_artif_chart = charts.DetailCouvArtifChart(project)
        detail_usage_artif_chart = charts.DetailUsageArtifChart(project)

        couv_artif_sol = charts.ArtifCouvSolPieChart(project)
        usage_artif_sol = charts.ArtifUsageSolPieChart(project)

        detail_couv_artif_table = detail_couv_artif_chart.get_series()
        for i in range(len(detail_couv_artif_table)):
            detail_couv_artif_table[i]["last_millesime"] = 0
            for row in couv_artif_sol.get_series():
                if row["code_prefix"] == detail_couv_artif_table[i]["code_prefix"]:
                    detail_couv_artif_table[i]["last_millesime"] = row["surface"]
                    break

        detail_usage_artif_table = detail_usage_artif_chart.get_series()
        for usage_row in detail_usage_artif_table:
            usage_row["last_millesime"] = 0
            for row in usage_artif_sol.get_series():
                if row["code_prefix"] == usage_row["code_prefix"]:
                    usage_row["last_millesime"] = row["surface"]
                    break

        kwargs.update(
            {
                "first_millesime": str(first_millesime),
                "last_millesime": str(last_millesime),
                "artif_area": artif_area,
                "rate_artif_area": rate_artif_area,
                "new_artif": progression_time_scoped["new_artif"],
                "new_natural": progression_time_scoped["new_natural"],
                "net_artif": net_artif,
                "net_artif_rate": net_artif_rate,
                "chart_evolution_artif": chart_evolution_artif,
                "table_evolution_artif": add_total_line_column(table_evolution_artif, line=False),
                "headers_evolution_artif": headers_evolution_artif,
                "detail_couv_artif_chart": detail_couv_artif_chart,
                "detail_couv_artif_table": detail_couv_artif_table,
                "detail_usage_artif_table": detail_usage_artif_table,
                "detail_total_artif": sum(_["artif"] for _ in detail_couv_artif_chart.get_series()),
                "detail_total_renat": sum(_["renat"] for _ in detail_couv_artif_chart.get_series()),
                "detail_usage_artif_chart": detail_usage_artif_chart,
                "couv_artif_sol": couv_artif_sol,
                "usage_artif_sol": usage_artif_sol,
                "chart_comparison": chart_comparison,
                "table_comparison": add_total_line_column(chart_comparison.get_series()),
                "level": level,
                "chart_waterfall": chart_waterfall,
                "nb_communes": project.cities.count(),
            }
        )

        return super().get_context_data(**kwargs)


class ProjectReportDownloadView(BreadCrumbMixin, CreateView):
    model = Request
    template_name = "project/report_download.html"
    fields = [
        "first_name",
        "last_name",
        "function",
        "organism",
        "email",
    ]

    def get_context_data(self, **kwargs):
        kwargs.update(
            {
                "project": Project.objects.get(pk=self.kwargs["pk"]),
            }
        )
        return super().get_context_data(**kwargs)

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
        form.instance.project = Project.objects.get(pk=self.kwargs["pk"])
        form.instance._change_reason = "New request"
        new_request = form.save()
        tasks.send_email_request_bilan.delay(new_request.id)
        tasks.generate_word_diagnostic.apply_async((new_request.id,), link=tasks.send_word_diagnostic.s())
        return self.render_to_response(self.get_context_data(success_message=True))


class ProjectReportTarget2031View(ProjectReportBaseView):
    template_name = "project/report_target_2031.html"
    breadcrumbs_title = "Rapport objectif 2031"

    def get_context_data(self, **kwargs):
        project = self.get_object()
        objective_chart = charts.ObjectiveChart(project)
        kwargs.update(
            {
                "diagnostic": project,
                "active_page": "target_2031",
                "objective_chart": objective_chart,
                "conso_2031_minus_10": objective_chart.conso_2031 * 0.9,
                "conso_2031_annual_minus_10": objective_chart.annual_objective_2031 * 0.9,
                "conso_2031_plus_10": objective_chart.conso_2031 * 1.1,
                "conso_2031_annual_plus_10": objective_chart.annual_objective_2031 * 1.1,
            }
        )

        return super().get_context_data(**kwargs)


class ProjectReportUrbanZonesView(ProjectReportBaseView):
    template_name = "project/report_urban_zones.html"
    breadcrumbs_title = "Rapport zonages d'urbanisme"

    def get_context_data(self, **kwargs):
        project = self.get_object()
        kwargs.update(
            {
                "diagnostic": project,
                "active_page": "urban_zones",
            }
        )

        return super().get_context_data(**kwargs)
    

class DownloadWordView(TemplateView):
    template_name = "project/error_download_word.html"

    def get(self, request, *args, **kwargs):
        """Redirect vers le fichier word du diagnostic si: le diagnostic est public ou est associé à l'utilisateur
        connecté. Sinon, affiche une page d'erreur."""
        req = Request.objects.get(pk=self.kwargs["request_id"])
        if req.project and req.project.is_public:  # le diagnostic est public
            return HttpResponseRedirect(req.sent_file.url)
        # le diagnostic n'est pas public, on vérifie que l'utilisateur connecté est bien le propriétaire du diagnostic
        if request.user.is_anonymous:
            messages.info(
                request,
                "Vous essayez d'accéder à un document privé. Veuillez vous connecter.",
            )
            return HttpResponseRedirect(f"{reverse('users:signin')}?next={request.path}")
        if request.user.id == req.user_id:
            return HttpResponseRedirect(req.sent_file.url)
        return super().get(request, *args, **kwargs)


class ConsoRelativeSurfaceChart(UserQuerysetOrPublicMixin, DetailView):
    context_object_name = "project"
    queryset = Project.objects.all()
    template_name = "project/partials/surface_comparison_conso.html"

    def get_context_data(self, **kwargs):
        indicateur_chart = charts.SurfaceChart(self.object)
        comparison_chart = charts.ConsoComparisonChart(self.object, relative=True)
        kwargs.update(
            {
                "diagnostic": self.object,
                "indicateur_chart": indicateur_chart,
                "indicateur_table": indicateur_chart.get_series(),
                "comparison_chart": comparison_chart,
                "comparison_table": add_total_line_column(comparison_chart.get_series(), line=False),
            }
        )
        return super().get_context_data(**kwargs)


class ConsoRelativePopChart(UserQuerysetOrPublicMixin, DetailView):
    context_object_name = "project"
    queryset = Project.objects.all()
    template_name = "project/partials/pop_comparison_conso.html"

    def get_context_data(self, **kwargs):
        conso_pop_chart = charts.ConsoComparisonPopChart(self.object)
        pop_chart = charts.PopChart(self.object)
        kwargs.update(
            {
                "diagnostic": self.object,
                "pop_chart": pop_chart,
                "pop_table": pop_chart.get_series(),
                "conso_pop_chart": conso_pop_chart,
                "conso_pop_table": add_total_line_column(conso_pop_chart.get_series(), line=False),
            }
        )
        return super().get_context_data(**kwargs)


class ConsoRelativeHouseholdChart(UserQuerysetOrPublicMixin, DetailView):
    context_object_name = "project"
    queryset = Project.objects.all()
    template_name = "project/partials/household_comparison_conso.html"

    def get_context_data(self, **kwargs):
        household_chart = charts.HouseholdChart(self.object)
        conso_household_chart = charts.ConsoComparisonHouseholdChart(self.object)
        kwargs.update(
            {
                "diagnostic": self.object,
                "household_chart": household_chart,
                "household_table": household_chart.get_series(),
                "conso_household_chart": conso_household_chart,
                "conso_household_table": add_total_line_column(conso_household_chart.get_series(), line=False),
            }
        )
        return super().get_context_data(**kwargs)


class ArtifZoneUrbaView(StandAloneMixin, DetailView):
    """Content of the pannel in Urba Area Explorator."""

    context_object_name = "zone_urba"
    queryset = ZoneUrba.objects.all()
    template_name = "project/partials/artif_zone_urba.html"

    def get_context_data(self, **kwargs):
        diagnostic = Project.objects.get(pk=self.kwargs["project_id"])
        zone_urba = self.get_object()
        artif_area = (
            Ocsge.objects.intersect(zone_urba.mpoly)
            .filter(is_artificial=True, year=diagnostic.last_year_ocsge)
            .aggregate(area=Sum("intersection_area") / 10000)
        )["area"]
        if artif_area is None:
            artif_area = 0
        kwargs |= {
            "diagnostic": diagnostic,
            "zone_urba": zone_urba,
            "surface": zone_urba.area,
            "total_artif_area": artif_area,
            "filling_artif_rate": artif_area * 100 / zone_urba.area,
        }
        return super().get_context_data(**kwargs)


class ArtifNetChart(TemplateView):
    template_name = "project/partials/artif_net_chart.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        self.diagnostic = Project.objects.get(pk=self.kwargs["pk"])
        self.zone_urba = None
        if "zone_urba_id" in self.request.GET:
            self.zone_urba = ZoneUrba.objects.get(pk=self.request.GET.get("zone_urba_id"))
        return super().get(request, *args, **kwargs)

    def get_data(self):
        """Expected format :
        [
            {"period": "2013 - 2016", "new_artif": 12, "new_natural": 2: "net_artif": 10},
            {"period": "2016 - 2019", "new_artif": 15, "new_natural": 7: "net_artif": 8},
        ]
        """
        Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=2154))
        qs = (
            OcsgeDiff.objects.intersect(self.zone_urba.mpoly)
            .filter(
                year_old__gte=self.diagnostic.first_year_ocsge,
                year_new__lte=self.diagnostic.last_year_ocsge,
            )
            .filter(Q(is_new_artif=True) | Q(is_new_natural=True))
            .annotate(
                period=Cast(Concat("year_old", Value(" - "), "year_new"), CharField(max_length=15)),
                area_artif=Case(When(is_new_artif=True, then=F("intersection_area")), default=Zero),
                area_renat=Case(When(is_new_natural=True, then=F("intersection_area")), default=Zero),
            )
            .order_by("period")
            .values("period")
            .annotate(
                new_artif=Cast(Sum("area_artif") / 10000, DecimalField(max_digits=15, decimal_places=2)),
                new_nat=Cast(Sum("area_renat") / 10000, DecimalField(max_digits=15, decimal_places=2)),
            )
        )
        return [
            {
                "period": _["period"],
                "new_artif": _["new_artif"],
                "new_natural": _["new_nat"],
                "net_artif": _["new_artif"] - _["new_nat"],
            }
            for _ in qs
        ]

    def get_chart(self):
        if self.zone_urba:
            # return chart with data within ZoneUrba polygon
            return charts.EvolutionArtifChart(self.diagnostic, get_data=self.get_data)
        # return classical chart for complete project
        return charts.EvolutionArtifChart(self.diagnostic)

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        artif_net_chart = self.get_chart()
        kwargs |= {
            "artif_net_chart": artif_net_chart,
        }
        return super().get_context_data(**kwargs)


class ArtifDetailCouvChart(TemplateView):
    template_name = "project/partials/artif_detail_couv_chart.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        self.diagnostic = Project.objects.get(pk=self.kwargs["pk"])
        self.zone_urba = None
        if "zone_urba_id" in self.request.GET:
            self.zone_urba = ZoneUrba.objects.get(pk=self.request.GET.get("zone_urba_id"))
        return super().get(request, *args, **kwargs)

    def get_data(self):
        """Expected format :
        [
            {
                "code_prefix": "CS1.1.1",
                "label": "Zone Bâti (maison,...)",
                "label_short": "Zone Bâti",
                "map_color": "#FF0000",
                "surface": 1000.0,
            },
            {...}
        ]
        """
        qs = (
            Ocsge.objects.intersect(self.zone_urba.mpoly)
            .filter(is_artificial=True, year=self.diagnostic.last_year_ocsge)
            .annotate(
                code_prefix=F("matrix__couverture__code_prefix"),
                label=F("matrix__couverture__label"),
                label_short=F("matrix__couverture__label_short"),
                map_color=F("matrix__couverture__map_color"),
            )
            .order_by("code_prefix", "label", "label_short", "map_color")
            .values("code_prefix", "label", "label_short", "map_color")
            .annotate(surface=Sum("intersection_area") / 10000)
        )
        return qs

    def get_charts(self):
        if self.zone_urba:
            # return chart with data within ZoneUrba polygon
            return (
                charts.ArtifCouvSolPieChart(self.diagnostic, get_data=self.get_data),
                charts.DetailCouvArtifChart(self.diagnostic, geom=self.zone_urba.mpoly),
            )
        # return classical chart for complete project
        return (
            charts.ArtifCouvSolPieChart(self.diagnostic),
            charts.DetailCouvArtifChart(self.diagnostic),
        )

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        couv_artif_sol, detail_couv_artif_chart = self.get_charts()

        detail_couv_artif_table = detail_couv_artif_chart.get_series()
        for i in range(len(detail_couv_artif_table)):
            detail_couv_artif_table[i]["last_millesime"] = 0
            for row in couv_artif_sol.get_series():
                if row["code_prefix"] == detail_couv_artif_table[i]["code_prefix"]:
                    detail_couv_artif_table[i]["last_millesime"] = row["surface"]
                    break
        kwargs |= {
            "couv_artif_sol": couv_artif_sol,
            "detail_couv_artif_chart": detail_couv_artif_chart,
            "detail_couv_artif_table": detail_couv_artif_table,
            "detail_total_artif": sum(_["artif"] for _ in detail_couv_artif_chart.get_series()),
            "detail_total_renat": sum(_["renat"] for _ in detail_couv_artif_chart.get_series()),
        }
        return super().get_context_data(**kwargs)


class ArtifDetailUsaChart(TemplateView):
    template_name = "project/partials/artif_detail_usage_chart.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        self.diagnostic = Project.objects.get(pk=self.kwargs["pk"])
        self.zone_urba = None
        if "zone_urba_id" in self.request.GET:
            self.zone_urba = ZoneUrba.objects.get(pk=self.request.GET.get("zone_urba_id"))
        return super().get(request, *args, **kwargs)

    def get_data(self):
        """Expected format :
        [
            {
                "code_prefix": "CS1.1.1",
                "label": "Zone Bâti (maison,...)",
                "label_short": "Zone Bâti",
                "map_color": "#FF0000",
                "surface": 1000.0,
            },
            {...}
        ]
        """
        qs = (
            Ocsge.objects.intersect(self.zone_urba.mpoly)
            .filter(is_artificial=True, year=self.diagnostic.last_year_ocsge)
            .annotate(
                code_prefix=F("matrix__usage__code_prefix"),
                label=F("matrix__usage__label"),
                label_short=F("matrix__usage__label_short"),
                map_color=F("matrix__usage__map_color"),
            )
            .order_by("code_prefix", "label", "label_short", "map_color")
            .values("code_prefix", "label", "label_short", "map_color")
            .annotate(surface=Sum("intersection_area") / 10000)
        )
        return qs

    def get_charts(self):
        if self.zone_urba:
            # return chart with data within ZoneUrba polygon
            return (
                charts.ArtifUsageSolPieChart(self.diagnostic, get_data=self.get_data),
                charts.DetailUsageArtifChart(self.diagnostic, geom=self.zone_urba.mpoly),
            )
        # return classical chart for complete project
        return (
            charts.ArtifUsageSolPieChart(self.diagnostic),
            charts.DetailUsageArtifChart(self.diagnostic),
        )

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        usage_artif_sol, detail_usage_artif_chart = self.get_charts()

        detail_usage_artif_table = detail_usage_artif_chart.get_series()
        for i in range(len(detail_usage_artif_table)):
            detail_usage_artif_table[i]["last_millesime"] = 0
            for row in usage_artif_sol.get_series():
                if row["code_prefix"] == detail_usage_artif_table[i]["code_prefix"]:
                    detail_usage_artif_table[i]["last_millesime"] = row["surface"]
                    break
        kwargs |= {
            "usage_artif_sol": usage_artif_sol,
            "detail_usage_artif_chart": detail_usage_artif_chart,
            "detail_usage_artif_table": detail_usage_artif_table,
            "detail_total_artif": sum(_["artif"] for _ in detail_usage_artif_chart.get_series()),
            "detail_total_renat": sum(_["renat"] for _ in detail_usage_artif_chart.get_series()),
        }
        return super().get_context_data(**kwargs)


class TestView(TemplateView):
    template_name = "project/test.html"
