from functools import cached_property
from typing import Any, Dict

from django.http import HttpResponse
from django.views.generic import FormView

from project import charts
from project.models import Project
from project.views import ProjectReportBaseView

from trajectory.forms import SelectYearPeriodForm, UpdateProjectTrajectoryForm, UpdateTrajectoryForm
from trajectory.models import Trajectory


class ProjectReportTrajectoryView(ProjectReportBaseView):
    template_name = "trajectory/report_trajectory.html"
    breadcrumbs_title = "Rapport trajectoires"

    def get_select_year_form(self, trajectory: Trajectory | None = None) -> SelectYearPeriodForm:
        if trajectory:
            initial = {
                "start": trajectory.start,
                "end": trajectory.end,
            }
        else:
            initial = {}
        return SelectYearPeriodForm(initial=initial)

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = self.get_object()
        trajectory = diagnostic.trajectory_set.all().first()
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "active_page": "trajectory",
                "form_period": self.get_select_year_form(trajectory),
            }
        )
        if trajectory:
            kwargs["form_year"] = UpdateProjectTrajectoryForm(
                diagnostic, trajectory.start, trajectory.end
            )
        return super().get_context_data(**kwargs)


class ProjectReportTrajectoryPeriodView(FormView):
    template_name = "trajectory/partials/select_year_period.html"
    form_class = SelectYearPeriodForm

    @cached_property
    def diagnostic(self):
        return Project.objects.get(pk=self.kwargs["pk"])

    def get_initial(self) -> Dict[str, Any]:
        kwargs_initial = super().get_initial()
        trajectory = self.diagnostic.trajectory_set.all().first()
        if trajectory:
            kwargs_initial |= {
                "start": trajectory.start,
                "end": trajectory.end,
            }
        return kwargs_initial

    def get_context_data(self, **kwargs):
        kwargs["project"] = self.diagnostic
        return super().get_context_data(**kwargs)

    def form_valid(self, form: SelectYearPeriodForm) -> HttpResponse:
        context = self.get_context_data(form=form)
        trajectory = self.diagnostic.trajectory_set.all().first()
        if trajectory:
            trajectory.start = form.cleaned_data["start"]
            trajectory.end = form.cleaned_data["end"]
            trajectory.save()
        else:
            trajectory = self.diagnostic.trajectory_set.create(
                name="Trajectoire 1",
                start=form.cleaned_data["start"],
                end=form.cleaned_data["end"],
                data={},
            )
        context |= {
            "start": form.cleaned_data["start"],
            "end": form.cleaned_data["end"],
            "form_consumption": UpdateTrajectoryForm(trajectory),
        }
        return self.render_to_response(context)


class ProjectReportTrajectoryConsumptionView(FormView):
    template_name = "trajectory/partials/set_year_consumption.html"
    form_class = UpdateTrajectoryForm

    @cached_property
    def diagnostic(self):
        return Project.objects.get(pk=self.kwargs["pk"])

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs() | {
            "trajectory": self.diagnostic.trajectory_set.all().first(),
        }
        return kwargs

    def get_context_data(self, **kwargs):
        kwargs |= {"project": self.diagnostic}
        return super().get_context_data(**kwargs)

    def form_valid(self, form: UpdateTrajectoryForm) -> HttpResponse:
        form.save()
        context = self.get_context_data(form=form) | {
            "trajectory_chart": charts.ObjectiveChart(self.diagnostic),
        }
        return self.render_to_response(context)
