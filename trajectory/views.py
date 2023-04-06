from functools import cached_property
from typing import Any, Callable, Dict

from django.http import HttpResponse
from django.views.generic import FormView

from project import charts
from project.models import Project
from project.views import ProjectReportBaseView

from trajectory.forms import (
    SelectYearPeriodForm,
    UpdateTrajectoryForm,
)


class ProjectReportTrajectoryView(ProjectReportBaseView):
    template_name = "trajectory/report_trajectory.html"
    breadcrumbs_title = "Rapport trajectoires"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = self.get_object()
        form_period = ProjectReportTrajectoryPeriodView(request=self.request, kwargs=self.kwargs).get_form()
        form_consumption = ProjectReportTrajectoryConsumptionView(request=self.request, kwargs=self.kwargs).get_form()
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "active_page": "trajectory",
                "form_period": form_period,
                "form_consumption": form_consumption,
                "trajectory_chart": charts.ObjectiveChart(diagnostic),
            }
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
        else:
            kwargs_initial |= {
                "start": 2021,
                "end": 2031,
            }
        return kwargs_initial

    def get_context_data(self, **kwargs):
        kwargs["project"] = self.diagnostic
        return super().get_context_data(**kwargs)

    def get_or_create_trajectory(self, start: int, end: int):
        trajectory = self.diagnostic.trajectory_set.all().first()
        if trajectory:
            trajectory.start = start
            trajectory.end = end
            trajectory.save()
        else:
            trajectory = self.diagnostic.trajectory_set.create(
                name="Trajectoire 1",
                start=start,
                end=end,
                data={},
            )
        return trajectory

    def form_valid(self, form: SelectYearPeriodForm) -> HttpResponse:
        self.get_or_create_trajectory(form.cleaned_data["start"], form.cleaned_data["end"])
        kwargs = {
            "form": form,
            "start": form.cleaned_data["start"],
            "end": form.cleaned_data["end"],
            "form_consumption": ProjectReportTrajectoryConsumptionView(
                request=self.request, kwargs=self.kwargs
            ).get_form(),
        }
        return self.render_to_response(self.get_context_data(**kwargs))


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

    def get_form(self, form_class: Callable | None = None) -> UpdateTrajectoryForm | None:
        try:
            return super().get_form(form_class=form_class)
        except AttributeError:
            return None

    def get_context_data(self, **kwargs):
        kwargs |= {"project": self.diagnostic}
        return super().get_context_data(**kwargs)

    def form_valid(self, form: UpdateTrajectoryForm) -> HttpResponse:
        form.save()
        context = self.get_context_data(form=form) | {
            "trajectory_chart": charts.ObjectiveChart(self.diagnostic),
        }
        return self.render_to_response(context)
