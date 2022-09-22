from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from project.storages import ExportStorage


class ExportListView(LoginRequiredMixin, TemplateView):
    template_name = "project/export/list.html"

    def get_context_data(self, **kwargs):
        storage = ExportStorage()
        kwargs["excel_file_list"] = (
            {"name": f, "url": storage.url(f)} for f in storage.list_excel()
        )
        return super().get_context_data(**kwargs)
