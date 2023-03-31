from functools import cached_property

from django.http import HttpResponse
from django.views.generic import FormView

from project import charts
from project.models import Project
from project.views import ProjectReportBaseView

from trajectory.forms import SelectYearPeriodForm, SetSpaceConsumationForm


class ProjectReportTrajectoryView(ProjectReportBaseView):
    template_name = "project/report_trajectory.html"
    breadcrumbs_title = "Rapport trajectoires"

    def get_context_data(self, **kwargs):
        diagnostic = self.get_object()
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "active_page": "trajectory",
                "form_period": SelectYearPeriodForm(),
            }
        )

        return super().get_context_data(**kwargs)


class ProjectReportTrajectoryPeriodView(FormView):
    template_name = "project/partials/select_year_period.html"
    form_class = SelectYearPeriodForm

    def get_context_data(self, **kwargs):
        kwargs["project"] = Project.objects.get(pk=self.kwargs["pk"])
        return super().get_context_data(**kwargs)

    def form_valid(self, form: SelectYearPeriodForm) -> HttpResponse:
        context = self.get_context_data(form=form)
        context |= {
            "start": form.cleaned_data["start"],
            "end": form.cleaned_data["end"],
            "form_consumption": SetSpaceConsumationForm(
                start=form.cleaned_data["start"], end=form.cleaned_data["end"]
            ),
        }
        return self.render_to_response(context)


class ProjectReportTrajectoryConsumptionView(FormView):
    template_name = "project/partials/set_year_consumption.html"
    form_class = SetSpaceConsumationForm

    @cached_property
    def diagnostic(self):
        return Project.objects.get(pk=self.kwargs["pk"])

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs() | {
            "start": self.kwargs["start"],
            "end": self.kwargs["end"],
        }
        return kwargs

    def get_context_data(self, **kwargs):
        kwargs |= {
            "project": self.diagnostic,
            "start": self.kwargs["start"],
            "end": self.kwargs["end"],
        }
        return super().get_context_data(**kwargs)

    def form_valid(self, form: SelectYearPeriodForm) -> HttpResponse:
        context = self.get_context_data(form=form) | {
            "trajectory_chart": charts.ObjectiveChart(self.diagnostic),
        }
        return self.render_to_response(context)
