import openpyxl
import pandas as pd
import re
from datetime import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import F
from django.views.generic import TemplateView

from project.models.project_base import Project
from project.storages import ExportStorage
from utils.excel import write_sheet
from public_data import CommunePop


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
        workbook = openpyxl.Workbook()

        qs = (
            CommunePop.objects.filter(city__in=project.cities.all())
            .annotate(city_name=F("city__name"))
            .values("city_name", "year", "pop_change")
        )
        df = (
            pd.DataFrame(qs, columns=["city_name", "year", "pop_change"])
            .fillna("")
            .pivot(columns=["year"], index=["city_name"], values="pop_change")
        )
        headers = [
            "Code INSEE",
            "Commune",
            "EPCI",
            "SCoT",
            "Département",
            "Région",
        ] + list(df.columns)

        # qs = project.get_pop_change_per_year("pop")
        # df = (
        #     pd.DataFrame(qs)
        #     .fillna("")
        #     .pivot(index=index, columns=column, values="total")
        #     .fillna(0)
        # )
        # data = [r for r in ]
        # write_sheet(
        #     workbook,
        #     data=data,
        #     headers=[
        #         "Code INSEE",
        #         "Commune",
        #         "EPCI",
        #         "SCoT",
        #         "Département",
        #         "Région",
        #     ],
        #     sheet_name="Population",
        # )
