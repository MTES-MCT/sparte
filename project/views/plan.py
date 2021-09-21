from django.contrib.auth.mixins import LoginRequiredMixin

# from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView

from project.models import Plan, Project

from .mixins import GetObjectMixin, UserQuerysetOnlyMixin


class GroupMixin(GetObjectMixin, LoginRequiredMixin, UserQuerysetOnlyMixin):
    """Simple trick to not repeat myself. Pertinence to be evaluated."""

    queryset = Plan.objects.all()
    context_object_name = "plan"


class PlanListView(GroupMixin, ListView):
    template_name = "project/plan/list.html"
    context_object_name = "plans"  # override to add an "s"


class PlanDetailView(GroupMixin, DetailView):
    template_name = "project/plan/detail.html"


class PlanCreateView(GroupMixin, CreateView):
    model = Plan
    template_name = "project/plan/create.html"
    fields = [
        "name",
        "description",
        "shape_file",
        "supplier_email",
    ]

    def get_project(self):
        project_id = self.kwargs["project_id"]
        return get_object_or_404(Project, pk=project_id)

    def form_valid(self, form):
        # required to set the user who is logged as creator
        form.instance.user = self.request.user
        form.instance.project = self.get_project()
        response = super().form_valid(form)  # save the data in db
        return response

    def get_success_url(self):
        return reverse_lazy("project:plan-detail", kwargs={"pk": self.object.id})


class PlanDeleteView(GroupMixin, DeleteView):
    model = Plan
    template_name = "project/plan/delete.html"
    success_url = reverse_lazy("project:plan-list")


class PlanUpdateView(GroupMixin, UpdateView):
    model = Plan
    template_name = "project/plan/update.html"
    fields = [
        "name",
        "description",
    ]

    def get_success_url(self):
        return reverse_lazy("project:plan-detail", kwargs=self.kwargs)
