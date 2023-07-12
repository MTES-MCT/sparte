from functools import cached_property
from math import floor
from typing import Any, Dict

from django.http import HttpResponse
from django.views.generic import FormView, TemplateView, UpdateView

from project.charts import ObjectiveChart
from project.models import Project
from project.views import ProjectReportBaseView
from trajectory.charts import TrajectoryChart
from trajectory.forms import DateEndForm, UpdateTrajectoryForm
from utils.htmx import StandAloneMixin


class ProjectReportTrajectoryView(ProjectReportBaseView):
    template_name = "trajectory/report_trajectory.html"
    breadcrumbs_title = "Rapport trajectoires"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = self.get_object()
        kwargs |= {"diagnostic": diagnostic, "active_page": "trajectory"}

        if diagnostic.trajectory_set.count() == 0:
            trajectory_chart = ObjectiveChart(diagnostic)
        else:
            trajectory_chart = TrajectoryChart(diagnostic)
            kwargs |= {
                "trajectory": diagnostic.trajectory_set.order_by("id").first(),
                "conso_perso": trajectory_chart.trajectory_cumulative,
                "annual_perso": trajectory_chart.trajectory_annual,
            }
        kwargs |= {
            "total_real": trajectory_chart.total_real,
            "annual_real": trajectory_chart.annual_real,
            "conso_2031": trajectory_chart.conso_2031,
            "annual_objective_2031": trajectory_chart.annual_objective_2031,
            "trajectory_chart": trajectory_chart,
        }
        return super().get_context_data(**kwargs)


class ProjectReportTrajectoryConsumptionView(StandAloneMixin, FormView):
    template_name = "trajectory/partials/update_trajectory.html"
    form_class = UpdateTrajectoryForm

    @cached_property
    def diagnostic(self):
        diagnostic = Project.objects.get(pk=self.kwargs["pk"])
        if diagnostic.trajectory_set.count() == 0:
            trajectory_chart = ObjectiveChart(diagnostic)
            diagnostic.trajectory_set.create(
                name="default",
                start=2021,
                end=2030,
                data={year: floor(trajectory_chart.annual_objective_2031) for year in range(2021, 2031)},
            )
        return diagnostic

    def get_form_kwargs(self):
        return super().get_form_kwargs() | {"trajectory": self.diagnostic.trajectory_set.order_by("id").first()}

    def get_context_data(self, **kwargs):
        kwargs |= {"diagnostic": self.diagnostic}
        return super().get_context_data(**kwargs)

    def post(self, request, *args, **kwargs):
        end_form = DateEndForm(**self.get_form_kwargs())
        if end_form.is_valid():
            end_form.save()
            form = self.get_form()
            if form.is_valid():
                return self.form_valid(form)
            else:
                return self.form_invalid(form)
        else:
            return self.form_invalid(self.get_form())

    def form_valid(self, form: UpdateTrajectoryForm) -> HttpResponse:
        form.save()
        return self.render_to_response(
            self.get_context_data(form=form, success_message=True),
            headers={"HX-Trigger": "load-graphic"},
        )


class ProjectReportTrajectoryGraphView(StandAloneMixin, TemplateView):
    template_name = "trajectory/partials/graphic.html"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = Project.objects.get(id=self.kwargs["pk"])
        if diagnostic.trajectory_set.count() == 0:
            trajectory_chart = ObjectiveChart(diagnostic)
        else:
            trajectory_chart = TrajectoryChart(diagnostic)
            kwargs |= {
                "trajectory": diagnostic.trajectory_set.order_by("id").first(),
                "conso_perso": trajectory_chart.trajectory_cumulative,
                "annual_perso": trajectory_chart.trajectory_annual,
            }
        kwargs |= {
            "reload_kpi": True,
            "diagnostic": diagnostic,
            "trajectory_chart": trajectory_chart,
            "total_real": trajectory_chart.total_real,
            "annual_real": trajectory_chart.annual_real,
            "conso_2031": trajectory_chart.conso_2031,
            "annual_objective_2031": trajectory_chart.annual_objective_2031,
        }
        return super().get_context_data(**kwargs)


class SetTargetView(UpdateView):
    model = Project
    template_name = "trajectory/partials/report_set_target_2031.html"
    fields = ["target_2031"]
    context_object_name = "diagnostic"

    def form_valid(self, form):
        self.object = form.save()
        return self.render_to_response(
            self.get_context_data(success_message=True),
            headers={"HX-Trigger": "load-graphic"},
        )
