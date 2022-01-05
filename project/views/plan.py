from django.contrib.auth.mixins import LoginRequiredMixin

# from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView

from project.models import Plan, Project
from project.forms import PlanForm

from utils.views_mixins import GetObjectMixin

from .mixins import UserQuerysetOnlyMixin


class GroupMixin(GetObjectMixin, LoginRequiredMixin, UserQuerysetOnlyMixin):
    """Simple trick to not repeat myself. Pertinence to be evaluated."""

    queryset = Plan.objects.all()
    context_object_name = "plan"

    def get_queryset(self):
        qs = self.queryset
        qs = qs.select_related("project")
        return qs

    def get_project(self):
        return None

    def get_context_data(self, **kwargs):
        return {
            **super().get_context_data(**kwargs),
            "project": self.get_project(),
        }


class PlanListView(GroupMixin, ListView):
    template_name = "project/plan/list.html"
    context_object_name = "plans"  # override to add an "s"

    def get_context_data(self, *args, **kwargs):
        projects = dict()
        for plan in self.get_queryset():
            if plan.project.name not in projects.keys():
                projects[plan.project.name] = []
            projects[plan.project.name].append(plan)
        return {**super().get_context_data(*args, **kwargs), "projects": projects}


class PlanCreateView(GroupMixin, CreateView):
    model = Plan
    template_name = "project/plan/create.html"
    form_class = PlanForm

    def get_project(self):
        if "project_id" in self.kwargs:
            id = self.kwargs.pop("project_id")
            return Project.objects.get(pk=id)
        else:
            return None

    def get_form_kwargs(self):
        """Add project in data passed to form init"""
        return {
            **super().get_form_kwargs(),
            "project": self.get_project(),
        }

    def form_valid(self, form):
        # required to set the user who is logged as creator
        form.instance.user = self.request.user
        # save the data in db
        response = super().form_valid(form)
        return response

    def get_success_url(self):
        return reverse_lazy("project:plan-detail", kwargs={"pk": self.object.id})


#
#  MANIPULATION D'UN SEUL OBJET
#


class PlanDetailView(GroupMixin, DetailView):
    template_name = "project/plan/detail.html"

    def get_project(self):
        return self.get_object().project

    def get_context_data(self, *args, **kwargs):
        plan = self.get_object()
        plan_url = reverse_lazy("project:planemprise-list") + f"?id={plan.id}"
        project_url = reverse_lazy("project:emprise-list") + f"?id={plan.project.id}"
        return {
            **super().get_context_data(*args, **kwargs),
            "carto_name": f"Plan {plan.name}",
            "center_lat": 44.6586,
            "center_lng": -1.164,
            "default_zoom": 10,
            "layer_list": [
                {
                    "name": f"Plan {plan.name}",
                    "url": plan_url,
                    "display": True,
                    "fit_map": True,
                    "level": "3",
                },
                {
                    "name": "Emprise du projet",
                    "url": project_url,
                    "display": True,
                    "style": "style_emprise",
                    "level": "5",
                },
                {
                    "name": "OCSGE",
                    "url": reverse_lazy("public_data:ocsge-optimized"),
                    "display": False,
                    "color_property_name": "map_color",
                    "level": "1",
                    "switch": "ocsge",
                },
            ],
        }


class PlanDeleteView(GroupMixin, DeleteView):
    model = Plan
    template_name = "project/plan/delete.html"
    success_url = reverse_lazy("project:plan-list")

    def get_project(self):
        return self.get_object().project


class PlanUpdateView(GroupMixin, UpdateView):
    model = Plan
    template_name = "project/plan/update.html"
    form_class = PlanForm

    def get_form_kwargs(self):
        """Add project in data passed to form init"""
        return {
            **super().get_form_kwargs(),
            "project": self.get_project(),
        }

    def get_project(self):
        return self.get_object().project

    def get_success_url(self):
        return reverse_lazy("project:plan-detail", kwargs=self.kwargs)
