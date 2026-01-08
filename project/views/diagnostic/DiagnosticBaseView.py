from django.conf import settings
from django.views.generic import DetailView

from project.models import Project


class DiagnosticBaseView(DetailView):
    context_object_name = "project"
    queryset = Project.objects.all()

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        kwargs.update({"project_id": project.id, "HIGHCHART_SERVER": settings.HIGHCHART_SERVER})

        return super().get_context_data(**kwargs)
