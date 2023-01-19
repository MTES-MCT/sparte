import pandas as pd
import re
from datetime import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import F
from django.views.generic import TemplateView

from project.models.project_base import Project
from project.storages import ExportStorage

# from utils.excel import write_sheet
from public_data.models import CommunePop


class ExportListView(LoginRequiredMixin, TemplateView):
    template_name = "project/export/list.html"

    def get_context_data(self, **kwargs):
        storage = ExportStorage()
        find_date = re.compile(r"(\d{8,8})_(\d{8,8})")
        kwargs["excel_file_list"] = []
        for f in storage.list_excel():
            if f.startswith("diag_downloaded"):
                dates = find_date.search(f).groups()
                kwargs["excel_file_list"].append(
                    {
                        "start": datetime.strptime(dates[0], "%d%m%Y").date(),
                        "end": datetime.strptime(dates[1], "%d%m%Y").date(),
                        "url": storage.url(f),
                    }
                )
        return super().get_context_data(**kwargs)


class ExportExcelView(LoginRequiredMixin, TemplateView):
    template_name = "project/export/excel.html"

    def get(self, request, *args, **kwargs):
        project = Project.objects.get(pk=kwargs["pk"])
        writer = pd.ExcelWriter("pandas_multiple.xlsx", engine="xlsxwriter")
        self.add_population_sheet(project, writer)

    def add_population_sheet(self, project, writer):
        headers = [
            "city_name",
            "insee",
            "epci",
            "scot",
            "dept",
            "region",
            "year",
            "pop_change",
        ]
        qs = (
            CommunePop.objects.filter(city__in=project.cities.all())
            .annotate(
                city_name=F("city__name"),
                insee=F("city__insee"),
                epci=F("city__epci__name"),
                scot=F("city__scot__name"),
                dept=F("city__departement__name"),
                region=F("city__departement__region__name"),
            )
            .values(*headers)
        )
        df = (
            pd.DataFrame(qs, columns=headers)
            .fillna("")
            .pivot(
                columns=["year"],
                index=headers[:6],
                values="pop_change",
            )
        )
        df.to_excel(writer, sheet_name="Population")
