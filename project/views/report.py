from decimal import InvalidOperation
from typing import Any, Dict

import pandas as pd
from django.conf import settings
from django.contrib import messages
from django.contrib.gis.db.models.functions import Area
from django.contrib.gis.geos import Polygon
from django.db import transaction
from django.db.models import Case, CharField, DecimalField, F, Q, Sum, Value, When
from django.db.models.functions import Cast, Concat
from django.db.models.query import QuerySet
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.generic import CreateView, DetailView, TemplateView

from brevo.tasks import send_diagnostic_request_to_brevo
from project import charts, tasks
from project.models import (
    Project,
    Request,
    RequestedDocumentChoices,
    trigger_async_tasks,
)
from project.utils import add_total_line_column
from public_data.domain.containers import PublicDataContainer
from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifferenceService import (
    ImpermeabilisationDifferenceService,
)
from public_data.domain.impermeabilisation.difference.ImperNetteTableMapper import (
    ImperNetteTableMapper,
)
from public_data.domain.impermeabilisation.difference.ImperSolTableMapper import (
    ImperSolTableMapper,
)
from public_data.infra.consommation.progression.table.ConsoByDeterminantTableMapper import (
    ConsoByDeterminantTableMapper,
)
from public_data.infra.consommation.progression.table.ConsoComparisonTableMapper import (
    ConsoComparisonMapper,
)
from public_data.infra.consommation.progression.table.ConsoProportionalComparisonTableMapper import (
    ConsoProportionalComparisonTableMapper,
)
from public_data.infra.demography.population.progression.table.PopulationConsoComparisonTableMapper import (
    PopulationConsoComparisonTableMapper,
)
from public_data.infra.demography.population.progression.table.PopulationConsoProgressionTableMapper import (
    PopulationConsoProgressionTableMapper,
)
from public_data.infra.planning_competency.PlanningCompetencyServiceSudocuh import (
    PlanningCompetencyServiceSudocuh,
)
from public_data.infra.urbanisme.autorisation_logement.progression.table.LogementVacantAutorisationConstructionRatioProgressionTableMapper import (  # noqa: E501
    LogementVacantAutorisationConstructionRatioProgressionTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantAutorisationConstructionComparisonTableMapper import (  # noqa: E501
    LogementVacantAutorisationConstructionComparisonTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantConsoProgressionTableMapper import (
    LogementVacantConsoProgressionTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantRatioProgressionTableMapper import (
    LogementVacantRatioProgressionTableMapper,
)
from public_data.models import CouvertureSol, UsageSol
from public_data.models.administration import AdminRef
from public_data.models.gpu import ZoneUrba
from public_data.models.ocsge import Ocsge, OcsgeDiff
from utils.htmx import StandAloneMixin
from utils.views_mixins import CacheMixin

from .mixins import ReactMixin


class ProjectReportBaseView(ReactMixin, CacheMixin, DetailView):
    context_object_name = "project"
    queryset = Project.objects.all()

    @transaction.non_atomic_requests
    def dispatch(self, request, *args, **kwargs):
        referer = request.META.get("HTTP_REFERER")
        previous_page_was_splash_screen = referer and "construction" in referer
        if not previous_page_was_splash_screen:
            project: Project = self.get_object()
            if not project.is_ready_to_be_displayed:
                trigger_async_tasks(project)
                return redirect("project:splash", pk=project.id)
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        kwargs.update({"project_id": project.id, "HIGHCHART_SERVER": settings.HIGHCHART_SERVER})

        return super().get_context_data(**kwargs)


class ProjectReportConsoView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/consommation.html"
    full_template_name = "project/pages/consommation.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        # Retrieve request level of analysis
        level = self.request.GET.get("level_conso", project.level)

        # communes_data_graph
        annual_total_conso_chart = charts.AnnualTotalConsoChart(project, level=level)
        if project.land_type == AdminRef.COMMUNE:
            annual_conso_data_table = add_total_line_column(annual_total_conso_chart.get_series(), line=False)
        else:
            annual_conso_chart = charts.AnnualConsoChart(project, level=level)
            annual_conso_data_table = add_total_line_column(annual_conso_chart.get_series())

        conso_period = project.get_bilan_conso_time_scoped()

        # Déterminants
        det_chart = charts.AnnualConsoByDeterminantChart(project)
        det_pie_chart = charts.ConsoByDeterminantPieChart(project)

        # CONSO
        consommation_progression = (
            PublicDataContainer.consommation_progression_service()
            .get_by_land(
                land=project.land_proxy,
                start_date=int(project.analyse_start_date),
                end_date=int(project.analyse_end_date),
            )
            .consommation
        )
        consommation_stats = PublicDataContainer.consommation_stats_service().get_by_land(
            project.land_proxy, project.analyse_start_date, project.analyse_end_date
        )
        consommation_comparison_stats = PublicDataContainer.consommation_stats_service().get_by_lands(
            lands=project.comparison_lands_and_self_land(),
            start_date=int(project.analyse_start_date),
            end_date=int(project.analyse_end_date),
        )

        # INSEE
        population_progression = (
            PublicDataContainer.population_progression_service()
            .get_by_land(
                land=project.land_proxy,
                start_date=int(project.analyse_start_date),
                end_date=int(project.analyse_end_date),
            )
            .population
        )
        population_stats = PublicDataContainer.population_stats_service().get_by_land(
            project.land_proxy, project.analyse_start_date, project.analyse_end_date
        )
        population_comparison_stats = PublicDataContainer.population_stats_service().get_by_lands(
            lands=project.comparison_lands_and_self_land(),
            start_date=int(project.analyse_start_date),
            end_date=int(project.analyse_end_date),
        )
        population_comparison_progression = PublicDataContainer.population_progression_service().get_by_lands(
            lands=project.comparison_lands_and_self_land(),
            start_date=int(project.analyse_start_date),
            end_date=int(project.analyse_end_date),
        )

        kwargs.update(
            {
                "diagnostic": project,
                "total_surface": project.area,
                "conso_period": conso_period,
                "is_commune": project.land_type == AdminRef.COMMUNE,
                "population_evolution": population_stats.evolution,
                "population_evolution_abs": abs(population_stats.evolution),
                "population_evolution_percent": population_stats.evolution_percent,
                "consommation_total": consommation_stats.total,
                "consommation_total_percent_of_area": consommation_stats.total_percent_of_area,
                # charts
                "determinant_per_year_chart": det_chart,
                "determinant_pie_chart": det_pie_chart,
                "comparison_chart": charts.AnnualConsoComparisonChart(project),
                "annual_total_conso_chart": annual_total_conso_chart,
                "surface_proportional_chart": charts.AnnualConsoProportionalComparisonChart(self.object),
                "population_density_chart": charts.PopulationDensityChart(project),
                "population_conso_progression_chart": charts.PopulationConsoProgressionChart(project),
                "population_conso_comparison_chart": charts.PopulationConsoComparisonChart(project),
                # data tables
                "annual_conso_data_table": annual_conso_data_table,
                "determinant_data_table": ConsoByDeterminantTableMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service()
                    .get_by_land(
                        land=project.land_proxy,
                        start_date=int(project.analyse_start_date),
                        end_date=int(project.analyse_end_date),
                    )
                    .consommation
                ),
                "comparison_table": ConsoComparisonMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                        lands=project.comparison_lands_and_self_land(),
                        start_date=int(project.analyse_start_date),
                        end_date=int(project.analyse_end_date),
                    )
                ),
                "surface_proportional_data_table": ConsoProportionalComparisonTableMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                        lands=project.comparison_lands_and_self_land(),
                        start_date=int(project.analyse_start_date),
                        end_date=int(project.analyse_end_date),
                    )
                ),
                "population_progression_table": PopulationConsoProgressionTableMapper.map(
                    consommation_progression, population_progression
                ),
                "population_comparison_table": PopulationConsoComparisonTableMapper.map(
                    from_year=int(project.analyse_start_date),
                    to_year=int(project.analyse_end_date),
                    consommation_comparison_stats=consommation_comparison_stats,
                    population_comparison_stats=population_comparison_stats,
                    population_comparison_progression=population_comparison_progression,
                ),
            }
        )

        return super().get_context_data(**kwargs)


class ProjectReportDicoverOcsgeView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/ocsge.html"
    full_template_name = "project/pages/ocsge.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
                "nom": "Rapport découvrir l'OCS GE",
                "surface_territory": project.area,
                "first_millesime": str(project.first_year_ocsge),
                "last_millesime": str(project.last_year_ocsge),
                "couv_pie_chart": charts.CouverturePieChart(project),
                "couv_progression_chart": charts.CouvertureProgressionChart(project),
                "usa_pie_chart": charts.UsagePieChart(project),
                "usa_progression_chart": charts.UsageProgressionChart(project),
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
                    "couv_wheel_chart": charts.CouvertureChangeWheelChart(project),
                }
            )

        # Usage

        usa_matrix_data = project.get_matrix(sol="usage")
        if usa_matrix_data:
            kwargs.update(
                {
                    "usa_matrix_data": add_total_line_column(usa_matrix_data),
                    "usa_matrix_headers": list(usa_matrix_data.values())[0].keys(),
                    "usa_whell_chart": charts.UsageChangeWheelChart(project),
                }
            )

        return super().get_context_data(**kwargs)


class ProjectReportSynthesisView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/synthese.html"
    full_template_name = "project/pages/synthese.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        progression_time_scoped = project.get_artif_progession_time_scoped()
        objective_chart = charts.ObjectiveChart(project)
        curent_conso = project.get_bilan_conso_time_scoped()
        zone_urba = project.get_artif_per_zone_urba_type()

        kwargs.update(
            {
                "diagnostic": project,
                "new_artif": progression_time_scoped["new_artif"],
                "new_natural": progression_time_scoped["new_natural"],
                "net_artif": progression_time_scoped["net_artif"],
                "objective_chart": objective_chart,
                "current_conso": curent_conso,
                "year_avg_conso": curent_conso / project.nb_years,
                "first_millesime": str(project.first_year_ocsge),
                "last_millesime": str(project.last_year_ocsge),
                "zone_list": zone_urba,
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportLogementVacantView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/logement_vacant.html"
    full_template_name = "project/pages/logement_vacant.html"
    start_date = 2019
    end_date = 2023
    end_date_conso = 2022

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=project.land_proxy,
            start_date=self.start_date,
            end_date=self.end_date,
        )

        autorisation_logement_progression = (
            PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                land=project.land_proxy,
                start_date=self.start_date,
                end_date=self.end_date,
            )
        )

        consommation_progression = PublicDataContainer.consommation_progression_service().get_by_land(
            land=project.land_proxy,
            start_date=self.start_date,
            end_date=self.end_date_conso,
        )

        kwargs.update(
            {
                "diagnostic": project,
                "logement_vacant_last_year": logement_vacant_progression.logement_vacant[-1],
                "autorisation_logement_last_year": autorisation_logement_progression.autorisation_logement[-1],
                # Charts
                "logement_vacant_autorisation_construction_comparison_chart": (
                    charts.LogementVacantAutorisationLogementComparisonChart(
                        project,
                        start_date=self.start_date,
                        end_date=self.end_date,
                    )
                ),
                "logement_vacant_autorisation_construction_ratio_gauge_chart": (
                    charts.LogementVacantAutorisationLogementRatioGaugeChart(
                        project,
                        start_date=self.start_date,
                        end_date=self.end_date,
                    )
                ),
                "logement_vacant_autorisation_logement_ratio_progression_chart": (
                    charts.LogementVacantAutorisationLogementRatioProgressionChart(
                        project,
                        start_date=self.start_date,
                        end_date=self.end_date,
                    )
                ),
                "logement_vacant_ratio_progression_chart": (
                    charts.LogementVacantRatioProgressionChart(
                        project,
                        start_date=self.start_date,
                        end_date=self.end_date,
                    )
                ),
                "logement_vacant_conso_progression_chart": (
                    charts.LogementVacantConsoProgressionChart(
                        project,
                        start_date=self.start_date,
                        end_date=self.end_date_conso,
                    )
                ),
                # Data tables
                "logement_vacant_autorisation_construction_comparison_data_table": (
                    LogementVacantAutorisationConstructionComparisonTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
                        autorisation_logement_progression=autorisation_logement_progression,
                    )
                ),
                "logement_vacant_ratio_progression_data_table": (
                    LogementVacantRatioProgressionTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
                    )
                ),
                "logement_vacant_autorisation_logement_ratio_progression_data_table": (
                    LogementVacantAutorisationConstructionRatioProgressionTableMapper.map(
                        autorisation_logement_progression=autorisation_logement_progression,
                    )
                ),
                "logement_vacant_conso_progression_data_table": (
                    LogementVacantConsoProgressionTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
                        consommation_progression=consommation_progression,
                    )
                ),
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportLocalView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/rapport_local.html"
    full_template_name = "project/pages/rapport_local.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportImperView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/impermeabilisation.html"
    full_template_name = "project/pages/impermeabilisation.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        difference = ImpermeabilisationDifferenceService.get_by_geom(
            geom=project.combined_emprise,
            start_date=project.first_year_ocsge,
            end_date=project.last_year_ocsge,
        )
        imper_nette_data_table = ImperNetteTableMapper.map(difference)
        imper_progression_couv_data_table = ImperSolTableMapper.map(difference)["couverture"]
        imper_progression_usage_data_table = ImperSolTableMapper.map(difference)["usage"]

        kwargs.update(
            {
                "diagnostic": project,
                "first_millesime": str(project.first_year_ocsge),
                "last_millesime": str(project.last_year_ocsge),
                "imper_nette_chart": charts.ImperNetteProgression(project),
                "imper_progression_couv_chart": charts.ImperProgressionByCouvertureChart(project),
                "imper_repartition_couv_chart": charts.ImperByCouverturePieChart(project),
                "imper_progression_usage_chart": charts.ImperProgressionByUsageChart(project),
                "imper_repartition_usage_chart": charts.ImperByUsagePieChart(project),
                "imper_nette_data_table": imper_nette_data_table,
                "imper_progression_couv_data_table": imper_progression_couv_data_table,
                "imper_progression_usage_data_table": imper_progression_usage_data_table,
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportArtifView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/artificialisation.html"
    full_template_name = "project/pages/artificialisation.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        total_surface = project.area
        level = self.request.GET.get("level_conso", project.level)
        is_commune = project.land_type == AdminRef.COMMUNE

        kwargs = {
            "land_type": project.land_type or "COMP",
            "diagnostic": project,
            "total_surface": total_surface,
            "is_commune": is_commune,
            "level": level,
        }

        if project.ocsge_coverage_status != project.OcsgeCoverageStatus.COMPLETE_UNIFORM:
            return super().get_context_data(**kwargs)

        kwargs |= self.get_ocsge_context(project, total_surface)

        if not is_commune:
            kwargs |= self.get_comparison_context(project, level)

        kwargs |= self.get_artif_net_table(project)

        return super().get_context_data(**kwargs)

    def get_ocsge_context(self, project, total_surface):
        first_millesime = project.first_year_ocsge
        last_millesime = project.last_year_ocsge

        artif_area = project.get_artif_area()
        rate_artif_area = round(100 * float(artif_area) / float(total_surface))

        chart_waterfall = charts.ArtifWaterfallChart(project)
        progression_time_scoped = chart_waterfall.get_series()

        net_artif = progression_time_scoped["net_artif"]

        try:
            net_artif_rate = 100 * net_artif / (artif_area - net_artif)
            # show + on front of net_artif
            net_artif = f"+{net_artif}" if net_artif > 0 else str(net_artif)
        except (TypeError, InvalidOperation):
            net_artif_rate = 0
            net_artif = "0"

        table_evolution_artif = charts.AnnualArtifChart(project).get_series()
        headers_evolution_artif = table_evolution_artif["Artificialisation"].keys()

        detail_couv_artif_chart = charts.ArtifProgressionByCouvertureChart(project)
        detail_usage_artif_chart = charts.ArtifProgressionByUsageChart(project)

        couv_artif_sol = charts.ArtifByCouverturePieChart(project)
        usage_artif_sol = charts.ArtifByUsagePieChart(project)

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

        return {
            "first_millesime": str(first_millesime),
            "last_millesime": str(last_millesime),
            "artif_area": artif_area,
            "rate_artif_area": rate_artif_area,
            "new_artif": progression_time_scoped["new_artif"],
            "new_natural": progression_time_scoped["new_natural"],
            "net_artif": net_artif,
            "net_artif_rate": net_artif_rate,
            "table_evolution_artif": table_evolution_artif,
            "headers_evolution_artif": headers_evolution_artif,
            "detail_couv_artif_chart": detail_couv_artif_chart,
            "detail_couv_artif_table": detail_couv_artif_table,
            "detail_usage_artif_table": detail_usage_artif_table,
            "detail_total_artif": sum(_["artif"] for _ in detail_couv_artif_chart.get_series()),
            "detail_total_renat": sum(_["renat"] for _ in detail_couv_artif_chart.get_series()),
            "detail_usage_artif_chart": detail_usage_artif_chart,
            "couv_artif_sol": couv_artif_sol,
            "usage_artif_sol": usage_artif_sol,
            "chart_waterfall": chart_waterfall,
        }

    def get_comparison_context(self, project, level):
        chart_comparison = charts.NetArtifComparaisonChart(project, level=level)

        return {
            "chart_comparison": chart_comparison,
            "table_comparison": add_total_line_column(chart_comparison.get_series()),
        }

    def get_artif_net_table(self, project):
        qs = project.get_artif_per_maille_and_period()
        df = pd.DataFrame.from_records(qs)
        pivot_df = df.pivot_table(
            index="name", columns="period", values=["new_artif", "new_natural", "net_artif"], aggfunc="sum"
        )
        pivot_df = pivot_df.swaplevel(0, 1, axis=1).sort_index(axis=1)
        pivot_df["total_net_artif"] = pivot_df.xs("net_artif", axis=1, level=1).sum(axis=1)
        pivot_df["area"] = df.groupby("name")["area"].first() * 10000
        pivot_df["net_artif_percentage"] = (pivot_df["total_net_artif"] / pivot_df["area"]) * 100
        periods = [
            _ for _ in pivot_df.columns.levels[0] if _ not in ["total_net_artif", "area", "net_artif_percentage"]
        ]
        records = [
            {
                "name": _[("name", "")],
                "total_net_artif": _[("total_net_artif", "")],
                "net_artif_percentage": _[("net_artif_percentage", "")],
                "area": _[("area", "")],
                "periods": [
                    {
                        "net_artif": _[(p, "net_artif")],
                        "new_artif": _[(p, "new_artif")],
                        "new_natural": _[(p, "new_natural")],
                    }
                    for p in periods
                ],
            }
            for _ in pivot_df.reset_index().to_dict(orient="records")
        ]
        return {
            "table_artif_net_records": records,
            "table_artif_net_periods": periods,
        }


class ProjectReportDownloadView(CreateView):
    model = Request
    template_name = "project/components/forms/report_download.html"
    fields = [
        "first_name",
        "last_name",
        "function",
        "organism",
        "email",
    ]

    def get_context_data(self, **kwargs):
        if self.kwargs.get("requested_document") not in RequestedDocumentChoices.values:
            raise ValueError(f"Invalid report type {self.kwargs.get('requested_document')}")

        kwargs.update(
            {
                "project": Project.objects.get(pk=self.kwargs["pk"]),
                "requested_document": self.kwargs["requested_document"],
                "requested_document_label": RequestedDocumentChoices(self.kwargs["requested_document"]).label,
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
        if self.request.user.is_authenticated:
            user = self.request.user
            form.instance.user = user
            user.first_name = form.instance.first_name or user.first_name
            user.last_name = form.instance.last_name or user.last_name
            user.function = form.instance.function or user.function
            user.organism = form.instance.organism or user.organism
            user.save()

        form.instance.project = Project.objects.get(pk=self.kwargs["pk"])
        form.instance.requested_document = self.kwargs["requested_document"]
        form.instance.du_en_cours = PlanningCompetencyServiceSudocuh.planning_document_in_revision(
            form.instance.project.land
        )
        form.instance.competence_urba = PlanningCompetencyServiceSudocuh.has_planning_competency(
            form.instance.project.land
        )
        form.instance._change_reason = "New request"
        new_request = form.save()
        send_diagnostic_request_to_brevo.delay(new_request.id)
        tasks.send_email_request_bilan.delay(new_request.id)
        tasks.generate_word_diagnostic.apply_async((new_request.id,), link=tasks.send_word_diagnostic.s())
        return self.render_to_response(self.get_context_data(success_message=True))


class ProjectReportTarget2031View(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/trajectoires.html"
    full_template_name = "project/pages/trajectoires.html"

    def get_context_data(self, **kwargs):
        diagnostic = self.get_object()
        target_2031_chart = charts.ObjectiveChart(diagnostic)
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "total_real": target_2031_chart.total_real,
                "annual_real": target_2031_chart.annual_real,
                "conso_2031": target_2031_chart.conso_2031,
                "annual_objective_2031": target_2031_chart.annual_objective_2031,
                "target_2031_chart": target_2031_chart,
                "target_2031_chart_data": target_2031_chart.dict(),
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportTarget2031GraphView(ProjectReportBaseView):
    template_name = "project/components/charts/report_target_2031_graphic.html"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = self.get_object()
        target_2031_chart = charts.ObjectiveChart(diagnostic)
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "target_2031_chart": target_2031_chart,
                "total_2020": target_2031_chart.total_2020,
                "annual_2020": target_2031_chart.annual_2020,
                "conso_2031": target_2031_chart.conso_2031,
                "annual_objective_2031": target_2031_chart.annual_objective_2031,
            }
        )
        return super().get_context_data(**kwargs)

    def get(self, request, *args, **kwargs):
        # Récupération du contexte via la méthode dédiée
        context = self.get_context_data(**kwargs)
        # Rendu du template avec le contexte obtenu
        return render(request, self.template_name, context)


class ProjectReportUrbanZonesView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/gpu.html"
    full_template_name = "project/pages/gpu.html"

    def get_context_data(self, **kwargs):
        project = self.get_object()
        kwargs.update(
            {
                "diagnostic": project,
                "zone_list": project.get_artif_per_zone_urba_type(),
                "first_year_ocsge": str(project.first_year_ocsge),
                "last_year_ocsge": str(project.last_year_ocsge),
            }
        )

        return super().get_context_data(**kwargs)


class DownloadWordView(TemplateView):
    template_name = "project/pages/error_download_word.html"

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


class ArtifZoneUrbaView(CacheMixin, StandAloneMixin, DetailView):
    """Content of the pannel in Urba Area Explorator."""

    queryset = ZoneUrba.objects.all()
    context_object_name = "zone_urba"
    template_name = "project/components/charts/artif_zone_urba.html"

    def get_object(self) -> QuerySet[Any]:
        return ZoneUrba.objects.get(checksum=self.kwargs["checksum"])

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
            "filling_artif_rate": artif_area * 100 / float(zone_urba.area),
        }
        return super().get_context_data(**kwargs)


class ArtifNetChart(CacheMixin, TemplateView):
    template_name = "project/components/charts/artif_net_chart.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        self.diagnostic = Project.objects.get(pk=self.kwargs["pk"])
        self.zone_urba = None
        if "zone_urba_id" in self.request.GET:
            self.zone_urba = ZoneUrba.objects.get(checksum=self.request.GET.get("zone_urba_id"))
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
            return charts.AnnualArtifChart(self.diagnostic, get_data=self.get_data)
        # return classical chart for complete project
        return charts.AnnualArtifChart(self.diagnostic)

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        artif_net_chart = self.get_chart()
        kwargs |= {
            "artif_net_chart": artif_net_chart,
        }
        return super().get_context_data(**kwargs)


class ArtifDetailCouvChart(CacheMixin, TemplateView):
    template_name = "project/components/charts/artif_detail_couv_chart.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        self.diagnostic = Project.objects.get(pk=self.kwargs["pk"])
        self.zone_urba = None
        if "zone_urba_id" in self.request.GET:
            self.zone_urba = ZoneUrba.objects.get(checksum=self.request.GET.get("zone_urba_id"))
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
            .order_by("couverture")
            .values("couverture")
            .annotate(surface=Sum("intersection_area") / 10000)
        )

        groups = []

        for group in qs:
            couverture = CouvertureSol.objects.get(code_prefix=group["couverture"])
            groups.append(
                {
                    "code_prefix": couverture.code_prefix,
                    "label": couverture.label,
                    "label_short": couverture.label_short,
                    "map_color": couverture.map_color,
                    "surface": group["surface"],
                }
            )

        return groups

    def get_charts(self):
        if self.zone_urba:
            # return chart with data within ZoneUrba polygon
            return (
                charts.ArtifByCouverturePieChart(self.diagnostic, get_data=self.get_data),
                charts.ArtifProgressionByCouvertureChart(self.diagnostic, geom=self.zone_urba.mpoly),
            )
        # return classical chart for complete project
        return (
            charts.ArtifByCouverturePieChart(self.diagnostic),
            charts.ArtifProgressionByCouvertureChart(self.diagnostic),
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
            "first_millesime": str(self.diagnostic.first_year_ocsge),
            "last_millesime": str(self.diagnostic.last_year_ocsge),
            "couv_artif_sol": couv_artif_sol,
            "detail_couv_artif_chart": detail_couv_artif_chart,
            "detail_couv_artif_table": detail_couv_artif_table,
            "detail_total_artif": sum(_["artif"] for _ in detail_couv_artif_chart.get_series()),
            "detail_total_renat": sum(_["renat"] for _ in detail_couv_artif_chart.get_series()),
            "detail_total_artif_period": sum(_["last_millesime"] for _ in detail_couv_artif_table),
        }
        return super().get_context_data(**kwargs)


class ArtifDetailUsaChart(CacheMixin, TemplateView):
    template_name = "project/components/charts/artif_detail_usage_chart.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        self.diagnostic = Project.objects.get(pk=self.kwargs["pk"])
        self.zone_urba = None
        if "zone_urba_id" in self.request.GET:
            self.zone_urba = ZoneUrba.objects.get(checksum=self.request.GET.get("zone_urba_id"))
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
            .order_by("usage")
            .values("usage")
            .annotate(surface=Sum("intersection_area") / 10000)
        )

        groups = []

        for group in qs:
            usage = UsageSol.objects.get(code_prefix=group["usage"])
            groups.append(
                {
                    "code_prefix": usage.code_prefix,
                    "label": usage.label,
                    "label_short": usage.label_short,
                    "map_color": usage.map_color,
                    "surface": group["surface"],
                }
            )

        return groups

    def get_charts(self):
        if self.zone_urba:
            # return chart with data within ZoneUrba polygon
            return (
                charts.ArtifByUsagePieChart(self.diagnostic, get_data=self.get_data),
                charts.ArtifProgressionByUsageChart(self.diagnostic, geom=self.zone_urba.mpoly),
            )
        # return classical chart for complete project
        return (
            charts.ArtifByUsagePieChart(self.diagnostic),
            charts.ArtifProgressionByUsageChart(self.diagnostic),
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
            "first_millesime": str(self.diagnostic.first_year_ocsge),
            "last_millesime": str(self.diagnostic.last_year_ocsge),
            "usage_artif_sol": usage_artif_sol,
            "detail_usage_artif_chart": detail_usage_artif_chart,
            "detail_usage_artif_table": detail_usage_artif_table,
            "detail_total_artif": sum(_["artif"] for _ in detail_usage_artif_chart.get_series()),
            "detail_total_renat": sum(_["renat"] for _ in detail_usage_artif_chart.get_series()),
            "detail_total_artif_period": sum(_["last_millesime"] for _ in detail_usage_artif_table),
        }
        return super().get_context_data(**kwargs)
