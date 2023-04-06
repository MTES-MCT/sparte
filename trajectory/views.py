from functools import cached_property
from typing import Any, Callable, Dict

from django.http import HttpResponse, HttpRequest
from django.views.generic import FormView

from project import charts
from project.models import Project
from project.views import ProjectReportBaseView

from trajectory.forms import (
    SelectYearPeriodForm,
    UpdateTrajectoryForm,
)


class SubViewMixin:
    @classmethod
    def html(cls, method: str, request: HttpRequest, kwargs: Dict) -> str:
        view = cls(request=request, kwargs=kwargs)  # type: ignore
        action = getattr(view, method)
        response = action(request, **kwargs).render()
        return response.content.decode("utf-8")

    @classmethod
    def get_html(cls, request: HttpRequest, kwargs: Dict) -> str:
        return cls.html("get", request, kwargs)


class ProjectReportTrajectoryView(ProjectReportBaseView):
    template_name = "trajectory/report_trajectory.html"
    breadcrumbs_title = "Rapport trajectoires"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = self.get_object()
        input_period = ProjectReportTrajectoryPeriodView.get_html(self.request, self.kwargs)
        input_consumption = ProjectReportTrajectoryConsumptionView.get_html(self.request, self.kwargs)
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "active_page": "trajectory",
                "conso_select_period_html": input_period,
                "conso_input_html": input_consumption,
                "trajectory_chart": charts.ObjectiveChart(diagnostic),
            }
        )
        return super().get_context_data(**kwargs)


class ProjectReportTrajectoryPeriodView(SubViewMixin, FormView):
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


class ProjectReportTrajectoryConsumptionView(SubViewMixin, FormView):
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
