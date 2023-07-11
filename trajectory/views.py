from functools import cached_property
from typing import Any, Callable, Dict

from django.http import HttpResponse
from django.views.generic import FormView, TemplateView

from project.models import Project
from project.views import ProjectReportBaseView
from trajectory import charts  # TrajectoryChart
from trajectory.forms import SelectYearPeriodForm, UpdateTrajectoryForm
from utils.htmx import StandAloneMixin


class ProjectReportTrajectoryView(ProjectReportBaseView):
    template_name = "trajectory/report_trajectory.html"
    breadcrumbs_title = "Rapport trajectoires"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = self.get_object()
        if diagnostic.trajectory_set.count() == 0:
            diagnostic.trajectory_set.create(name="default", start=2021, end=2031, data={})
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "active_page": "trajectory",
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportTrajectoryConsumptionView(StandAloneMixin, FormView):
    template_name = "trajectory/partials/update_trajectory.html"
    form_class = UpdateTrajectoryForm

    @cached_property
    def diagnostic(self):
        return Project.objects.get(pk=self.kwargs["pk"])

    def get_form_kwargs(self):
        return super().get_form_kwargs() | {"trajectory": self.diagnostic.trajectory_set.order_by("id").first()}

    def get_context_data(self, **kwargs):
        kwargs |= {"project": self.diagnostic}
        return super().get_context_data(**kwargs)

    def form_valid(self, form: UpdateTrajectoryForm) -> HttpResponse:
        form.save()
        form_kwargs = self.get_form_kwargs()
        if "data" in form_kwargs:
            del form_kwargs["data"]
        form = UpdateTrajectoryForm(**form_kwargs)
        context = self.get_context_data(form=form) | {"success_message": True}
        response = self.render_to_response(context)
        response["HX-Trigger"] = "load-graphic"
        return response


class ProjectReportTrajectoryGraphView(StandAloneMixin, TemplateView):
    template_name = "trajectory/partials/graphic.html"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = Project.objects.get(id=self.kwargs["pk"])
        kwargs |= {
            "diagnostic": diagnostic,
            "trajectory_chart": charts.TrajectoryChart(diagnostic),
        }
        return super().get_context_data(**kwargs)
