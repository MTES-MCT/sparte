from functools import cached_property
import json
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
    def trajectory_chart(self):
        return ObjectiveChart(self.diagnostic)

    @cached_property
    def trajectory(self):
        return self.diagnostic.trajectory_set.order_by("id").first()

    @cached_property
    def diagnostic(self):
        return Project.objects.get(pk=self.kwargs["pk"])

    def get_form_kwargs(self):
        kwargs = {"default": 0}
        try:
            kwargs |= {"start": self.trajectory.start, "end": self.trajectory.end}
        except AttributeError:
            pass
        return super().get_form_kwargs() | kwargs

    def get_initial(self):
        """Return the initial data to use for forms on this view."""
        data = {}
        try:
            for y, v in self.trajectory.data.items():
                data |= {f"year_{y}": v.get("value"), f"year_updated_{y}": v.get("updated")}
            return data
        except AttributeError:
            return {}

    def get_context_data(self, **kwargs):
        trajectory_chart = self.trajectory_chart
        kwargs |= {
            "diagnostic": self.diagnostic,
            "choices": [str(i) for i in range(2021, 2051)],
            "cumul": trajectory_chart.total_real,
            "avg_2031": trajectory_chart.annual_objective_2031,
            "start_year": "2021",
        }
        if "form" not in kwargs:
            kwargs["form"] = self.get_form()
        kwargs["data"] = json.dumps(
            {
                n[-4:]: {"value": f.initial, "updated": kwargs["form"].fields[f"year_updated_{n[-4:]}"].initial}
                for n, f in kwargs["form"].fields.items()
                if n.startswith("year_2")
            }
        )
        try:
            kwargs["end_year"] = str(self.trajectory.end)
        except AttributeError:
            kwargs["end_year"] = "2030"
        return super().get_context_data(**kwargs)

    def post(self, request, *args, **kwargs):
        end_form = DateEndForm(data=self.request.POST)
        if end_form.is_valid():
            trajectory = self.trajectory
            if not trajectory:
                trajectory = self.diagnostic.trajectory_set.create(
                    name="default",
                    start=2021,
                    end=2030,
                    data={
                        year: {
                            "value": self.trajectory_chart.annual_objective_2031,
                            "updated": False,
                        }
                        for year in range(2021, int(end_form.cleaned_data["end"]) + 1)
                    },
                )
            trajectory.end = end_form.cleaned_data["end"]
            trajectory.save()
            form = self.get_form()
            if form.is_valid():
                trajectory.data = {
                    str(y): {
                        "value": form.cleaned_data[f"year_{y}"],
                        "updated": form.cleaned_data[f"year_updated_{y}"],
                    }
                    for y in range(2021, int(end_form.cleaned_data["end"]) + 1)
                }
                trajectory.save()
                return self.form_valid(form)
            else:
                return self.form_invalid(form)
        else:
            return self.form_invalid(self.get_form())

    def form_valid(self, form: UpdateTrajectoryForm) -> HttpResponse:
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
