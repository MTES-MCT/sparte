from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import ListView
from django.views.generic.edit import CreateView, DeleteView, UpdateView

from .models import Project
from .tasks import import_shp


class ProjectListView(LoginRequiredMixin, ListView):
    queryset = Project.objects.all()
    template_name = "project/list.html"
    context_object_name = "projects"

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user=user)


class ProjectCreateView(LoginRequiredMixin, CreateView):
    model = Project
    template_name = "project/form.html"
    fields = ["name", "shape_file", "analyse_start_date", "analyse_end_date"]

    def form_valid(self, form):
        # required to set the user who is logged as creator
        form.instance.user = self.request.user
        response = super().form_valid(form)  # save the data in db
        # add asynchronous task to load emprise
        import_shp.delay(form.instance.id)
        return response


class ProjectUpdateView(LoginRequiredMixin, UpdateView):
    model = Project
    template_name = "project/detail.html"
    fields = ["name", "shape_file", "analyse_start_date", "analyse_end_date"]


class ProjectDeleteView(LoginRequiredMixin, DeleteView):
    model = Project
    success_url = reverse_lazy("project:list")
