from decimal import InvalidOperation

from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse, reverse_lazy
from django.views.generic import CreateView, DetailView
from django_app_parameter import app_parameter

from project import charts, tasks
from project.models import Project, ProjectCommune, Request
from project.utils import add_total_line_column
from public_data.models import CouvertureSol, UsageSol

from .mixins import BreadCrumbMixin, GroupMixin


class ProjectReportBaseView(GroupMixin, DetailView):
    breadcrumbs_title = "To be set"
    context_object_name = "project"
    queryset = Project.objects.all()

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": self.breadcrumbs_title})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        kwargs["ocsge_available"] = self.object.is_artif()
        return super().get_context_data(**kwargs)


class ProjectReportConsoView(ProjectReportBaseView):
    template_name = "project/rapport_consommation.html"
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
                    "forecast_2031": project.nb_years_before_2031
                    * current_conso
                    / project.nb_years,
                },
                # charts
                "determinant_per_year_chart": det_chart,
                "determinant_pie_chart": charts.DeterminantPieChart(
                    project, series=det_chart.get_series()
                ),
                "comparison_chart": comparison_chart,
                "commune_chart": chart_conso_cities,
                # tables
                "communes_data_table": add_total_line_column(
                    chart_conso_cities.get_series()
                ),
                "data_determinant": add_total_line_column(det_chart.get_series()),
                "groups_names": groups_names,
                "level": level,
                "objective_chart": objective_chart,
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
            return [
                city_group
                for city_group in city_group_list
                if city_group.name is not None
            ]

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
    template_name = "project/rapport_discover_ocsge.html"
    breadcrumbs_title = "Rapport découvrir l'OCS GE"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        surface_territory = project.area
        kwargs = {
            "nom": "Rapport découvrir l'OCS GE",
            "surface_territory": surface_territory,
            "active_page": "discover",
        }

        if not project.is_artif():
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
                "couv_leafs": CouvertureSol.get_leafs(),
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
    template_name = "project/rapport_usage.html"
    breadcrumbs_title = "Rapport sur l'usage des sols"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        surface_territory = project.area
        kwargs = {
            "nom": "Usage",
            "surface_territory": surface_territory,
            "active_page": "usage",
        }

        if not project.is_artif():
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
    template_name = "project/rapport_synthesis.html"
    breadcrumbs_title = "Synthèse consommation d'espace et artificialisation"

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
                "information_synthesis_1": "<p class='fr-text--sm mb-3'>L'article 191 de la Loi Climat & Résilience exprime que :</p>" +
                    "<p class='fr-text--sm mb-3'><i>« Afin d’atteindre l’objectif national d’absence de toute artificialisation nette des sols en 2050, le rythme de <strong>l’artificialisation des sols</strong> dans les dix années suivant la promulgation de la présente loi doit être tel que, sur cette période, <strong>la consommation totale d’espaces</strong> observée à l’échelle nationale soit inférieure à la moitié de celle observée sur les dix années précédant cette date.»</i></p>" +
                    "<p class='fr-text--sm mb-3'>Informations clés à retenir sur la mise en œuvre:</p>" +
                    "<ul class='fr-text--sm'>" +
                    "<li>Entre 2021 et 2031 à l'échelle de la région, il est demandé de diviser par 2  la consommation d'espaces Naturels, Agricoles et Forestiers mesurée entre 2011 et 2021.</li>" +
                    "<li>D'ici février 2024, les SRADDET territorialiseront les objectifs de diminution pour chaque SCoT.</li>" +
                    "</ul>" +
                    "<p class='fr-text--sm mb-3'>SPARTE vous accompagne dans le suivi de ces nouvelles règles en produisant des indicateurs s'appuyant sur:</p>" +
                    "<ul class='fr-text--sm mb-0'>" +
                    "<li>la base de données d'OCcupation des Sols à Grande Echelle (OCS GE) de l'IGN ;</li>" +
                    "<li>les fichiers fonciers du Cérema issus des données MAJIC (Mise A Jour de l'Information Cadastrale) de la DGFIP ;</li>" +
                    "<li>les données, en particulier du recensement, de l'INSEE</li>" +
                    "</ul>",
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportArtifView(ProjectReportBaseView):
    template_name = "project/rapport_artif.html"
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

        if not project.is_artif():
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

        detail_artif_chart = charts.DetailArtifChart(project)

        couv_artif_sol = charts.ArtifCouvSolPieChart(project)
        usage_artif_sol = charts.ArtifUsageSolPieChart(project)

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
                "table_evolution_artif": add_total_line_column(
                    table_evolution_artif, line=False
                ),
                "headers_evolution_artif": headers_evolution_artif,
                "detail_artif_chart": detail_artif_chart,
                "detail_total_artif": sum(
                    _["artif"] for _ in detail_artif_chart.get_series()
                ),
                "detail_total_renat": sum(
                    _["renat"] for _ in detail_artif_chart.get_series()
                ),
                "couv_artif_sol": couv_artif_sol,
                "usage_artif_sol": usage_artif_sol,
                "chart_comparison": chart_comparison,
                "table_comparison": add_total_line_column(
                    chart_comparison.get_series()
                ),
                "level": level,
                "chart_waterfall": chart_waterfall,
            }
        )

        return super().get_context_data(**kwargs)


class ProjectReportDownloadView(BreadCrumbMixin, CreateView):
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
        breadcrumbs = super().get_context_breadcrumbs() + [
            {"href": reverse_lazy("project:list"), "title": "Mes diagnostics"},
            {
                "href": reverse_lazy("project:detail", kwargs={"pk": self.project.id}),
                "title": self.project.name,
            },
            {"href": None, "title": "Téléchargement du bilan"},
        ]
        return breadcrumbs

    def get_context_data(self, **kwargs):
        self.project = Project.objects.get(pk=self.kwargs["pk"])
        kwargs.update(
            {
                "project": self.project,
                "url_bilan": app_parameter.BILAN_EXAMPLE,
                "active_page": "download",
                "ocsge_available": self.project.is_artif(),
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
        new_request = form.save()
        tasks.send_email_request_bilan.delay(new_request.id)
        tasks.generate_word_diagnostic.apply_async(
            (new_request.id,), link=tasks.send_word_diagnostic.s()
        )
        messages.success(
            self.request,
            (
                "Votre demande de bilan a été enregistrée, un e-mail de confirmation "
                "vous a été envoyé."
            ),
        )
        succes_url = new_request.project.get_absolute_url()
        return HttpResponseRedirect(succes_url)


class ProjectReportConsoRelativeView(ProjectReportBaseView):
    template_name = "project/rapport_conso_relative.html"
    breadcrumbs_title = "Rapport consommation relative"

    def get_context_data(self, **kwargs):
        project = kwargs.get("object", self.get_object())

        conso_pop_chart = charts.ConsoComparisonPopChart(project)
        pop_chart = charts.PopChart(project)
        household_chart = charts.HouseholdChart(project)
        conso_household_chart = charts.ConsoComparisonHouseholdChart(project)
        surface_chart = charts.SurfaceChart(project)
        conso_surface_chart = charts.ConsoComparisonChart(project, relative=True)

        kwargs.update(
            {
                "active_page": "consommation",
                "pop_chart": pop_chart,
                "pop_table": add_total_line_column(pop_chart.get_series(), line=False),
                "conso_pop_chart": conso_pop_chart,
                "conso_pop_table": add_total_line_column(
                    conso_pop_chart.get_series(), line=False
                ),
                "household_chart": household_chart,
                "household_table": add_total_line_column(
                    household_chart.get_series(), line=False
                ),
                "conso_household_chart": conso_household_chart,
                "conso_household_table": add_total_line_column(
                    conso_household_chart.get_series(), line=False
                ),
                "surface_chart": surface_chart,
                "surface_table": surface_chart.get_series(),
                "conso_surface_chart": conso_surface_chart,
                "conso_surface_table": add_total_line_column(
                    conso_surface_chart.get_series(), line=False
                ),
            }
        )

        return super().get_context_data(**kwargs)


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
                "information_target_2031": "<p class='fr-text--sm mb-3'>La Loi Climat & Résilience recommande :</p>" +
                    "<ul class='fr-text--sm'>" +
                    "<li>entre 2021 et 2031 à l'échelle régionale, de diviser par 2  la consommation d'espaces Naturels, Agricoles et Forestiers mesurée entre 2011 et 2021 ;</li>" +
                    "<li>d'ici février 2024, que les SRADDET territorialisent les objectifs de diminution pour chaque SCoT.</li>" +
                    "</ul>" +
                    "<p class='fr-text--sm mb-3'>En attente de territorialisation des objectifs de la loi Climat & Résilience, SPARTE fait une première simulation à l'échelle du territoire de diagnostic en divisant par 2 la consommation d'espaces par rapport au bilan 2011-2021.</p>" +
                    "<p class='fr-text--sm mb-3'>Pour la mesure de la consommation d'espaces NAF, l'Etat utilise les fichiers fonciers.</p>" +
                    "<p class='fr-text--sm mb-3'>Ces données sont fournies tous les ans depuis 2009. Le dernier millésime de 2021 est la photographie du territoire au 1er janvier 2021, intégrant les évolutions réalisées au cours de l'année 2020.</p>",
            }
        )

        return super().get_context_data(**kwargs)
