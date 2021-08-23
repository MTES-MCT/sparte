from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import ListView
from django.views.generic.edit import CreateView, DeleteView, UpdateView

from .models import Project


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
        form.instance.user = self.request.user
        return super().form_valid(form)

    # def form_valid(self, form):
    #     project = form.save(commit=False)
    #     shp_file = form.cleaned_data['shape_file']
    #     obj.user = self.request.user
    #     profile.save()

    #     return HttpResponseRedirect(self.get_success_url())


class ProjectUpdateView(LoginRequiredMixin, UpdateView):
    model = Project
    template_name = "project/detail.html"
    fields = ["name", "shape_file", "analyse_start_date", "analyse_end_date"]


class ProjectDeleteView(LoginRequiredMixin, DeleteView):
    model = Project
    success_url = reverse_lazy("project:list")
