from typing import Any, Dict

from django.conf import settings
from django.contrib import messages
from django.db import transaction
from django.http import HttpResponseRedirect
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
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantProgressionTableMapper import (
    LogementVacantProgressionTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantRatioProgressionTableMapper import (
    LogementVacantRatioProgressionTableMapper,
)
from public_data.models.administration import AdminRef
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


class ProjectReportSynthesisView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/synthese.html"
    full_template_name = "project/pages/synthese.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        objective_chart = charts.ObjectiveChart(project)
        curent_conso = project.get_bilan_conso_time_scoped()

        kwargs.update(
            {
                "diagnostic": project,
                "objective_chart": objective_chart,
                "current_conso": curent_conso,
                "year_avg_conso": curent_conso / project.nb_years,
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportLogementVacantView(ProjectReportBaseView):
    partial_template_name = "project/components/dashboard/logement_vacant.html"
    full_template_name = "project/pages/logement_vacant.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        start_date = 2019
        end_date = 2023
        end_date_conso = 2022
        has_logement_vacant = project.logements_vacants_available
        has_autorisation_logement = project.autorisation_logement_available

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=project.land_proxy,
            start_date=start_date,
            end_date=end_date,
        )

        consommation_progression = PublicDataContainer.consommation_progression_service().get_by_land(
            land=project.land_proxy,
            start_date=start_date,
            end_date=end_date_conso,
        )

        kwargs.update(
            {
                "diagnostic": project,
                "has_autorisation_logement": has_autorisation_logement,
                "logement_vacant_last_year": logement_vacant_progression.get_last_year_logement_vacant(),
                # Charts
                "logement_vacant_progression_chart": (
                    charts.LogementVacantProgressionChart(
                        project,
                        start_date=start_date,
                        end_date=end_date,
                    )
                ),
                "logement_vacant_ratio_progression_chart": (
                    charts.LogementVacantRatioProgressionChart(
                        project,
                        start_date=start_date,
                        end_date=end_date,
                    )
                ),
                "logement_vacant_conso_progression_chart": (
                    charts.LogementVacantConsoProgressionChart(
                        project,
                        start_date=start_date,
                        end_date=end_date_conso,
                    )
                ),
                # Data tables
                "logement_vacant_progression_data_table": (
                    LogementVacantProgressionTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
                    )
                ),
                "logement_vacant_ratio_progression_data_table": (
                    LogementVacantRatioProgressionTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
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

        if has_logement_vacant and has_autorisation_logement:
            autorisation_logement_progression = (
                PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                    land=project.land_proxy,
                    start_date=start_date,
                    end_date=end_date,
                )
            )

            kwargs.update(
                {
                    "autorisation_logement_last_year": autorisation_logement_progression.get_last_year_autorisation_logement(),  # noqa: E501
                    # Charts
                    "logement_vacant_autorisation_construction_comparison_chart": (
                        charts.LogementVacantAutorisationLogementComparisonChart(
                            project,
                            start_date=start_date,
                            end_date=end_date,
                        )
                    ),
                    "logement_vacant_autorisation_construction_ratio_gauge_chart": (
                        charts.LogementVacantAutorisationLogementRatioGaugeChart(
                            project,
                            start_date=start_date,
                            end_date=end_date,
                        )
                    ),
                    "logement_vacant_autorisation_logement_ratio_progression_chart": (
                        charts.LogementVacantAutorisationLogementRatioProgressionChart(
                            project,
                            start_date=start_date,
                            end_date=end_date,
                        )
                    ),
                    # Data tables
                    "logement_vacant_autorisation_construction_comparison_data_table": (
                        LogementVacantAutorisationConstructionComparisonTableMapper.map(
                            logement_vacant_progression=logement_vacant_progression,
                            autorisation_logement_progression=autorisation_logement_progression,
                        )
                    ),
                    "logement_vacant_autorisation_logement_ratio_progression_data_table": (
                        LogementVacantAutorisationConstructionRatioProgressionTableMapper.map(
                            autorisation_logement_progression=autorisation_logement_progression,
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
