import io
import pandas as pd
import re
from datetime import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import F
from django.http import FileResponse
from django.views.generic import TemplateView, View

from project.models.project_base import Project
from project.storages import ExportStorage

# from utils.excel import write_sheet
from public_data.models import Cerema, CommunePop


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


class ExportExcelView(LoginRequiredMixin, View):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.project: Project = None
        self.writer: pd.ExcelWriter = None
        self.default_config = [
            {"name": "Commune", "db": "city__name", "type": "index"},
            {"name": "Insee", "db": "city__insee", "type": "index"},
            {"name": "EPCI", "db": "city__epci__name", "type": "index"},
            {"name": "SCoT", "db": "city__scot__name", "type": "index"},
            {"name": "Département", "db": "city__departement__name", "type": "index"},
            {
                "name": "Région",
                "db": "city__departement__region__name",
                "type": "index",
            },
        ]

    def get(self, request, *args, **kwargs) -> FileResponse:
        self.project = Project.objects.get(pk=kwargs["pk"])
        return FileResponse(
            self.get_excel_as_buffer(),
            content_type=(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
                "charset=utf-8"
            ),
            as_attachment=True,
            filename=f"données du diagnostic {self.project.name}.xlsx",
        )

    def get_excel_as_buffer(self) -> io.BytesIO():
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as self.writer:
            self.add_population_sheet()
            self.add_menages_sheet()
            self.add_conso_sheet()
        buffer.seek(0)
        return buffer

    def generate_dataframe(self, config, queryset):
        """Retrieve data from db and load it in a dataframe, then make a pivot to format
        data.

        All operations are defined in a config list:
        > config = [
        >     {"name":"Commune", "db":"city__name", "type": "index"},
        >     ...
        > ]
        "type" should be one of : columns, index or values
        """
        # preparation
        anotations = {_["name"]: F(_["db"]) for _ in config}
        headers = [_["name"] for _ in config]
        columns = [_["name"] for _ in config if _["type"] == "columns"]
        index = [_["name"] for _ in config if _["type"] == "index"]
        values = [_["name"] for _ in config if _["type"] == "values"]
        # get data formated from queryset
        qs = queryset.annotate(**anotations).values(*headers)
        # add data to dataframe and make the pivot
        df = (
            pd.DataFrame(qs, columns=headers)
            .fillna(0.0)
            .pivot(columns=columns, index=index, values=values)
        )
        return df

    def add_population_sheet(self) -> None:
        config = [
            {"name": "Commune", "db": "city__name", "type": "index"},
            {"name": "Insee", "db": "city__insee", "type": "index"},
            {"name": "EPCI", "db": "city__epci__name", "type": "index"},
            {"name": "SCoT", "db": "city__scot__name", "type": "index"},
            {"name": "Département", "db": "city__departement__name", "type": "index"},
            {
                "name": "Région",
                "db": "city__departement__region__name",
                "type": "index",
            },
            {"name": "Année", "db": "year", "type": "columns"},
            {"name": "Changement", "db": "pop_change", "type": "values"},
            {"name": "Total", "db": "pop", "type": "values"},
        ]
        qs = CommunePop.objects.filter(city__in=self.project.cities.all())
        df = self.generate_dataframe(config, qs)
        df.to_excel(self.writer, sheet_name="Population")

    def add_menages_sheet(self):
        config = [
            {"name": "Commune", "db": "city__name", "type": "index"},
            {"name": "Insee", "db": "city__insee", "type": "index"},
            {"name": "EPCI", "db": "city__epci__name", "type": "index"},
            {"name": "SCoT", "db": "city__scot__name", "type": "index"},
            {"name": "Département", "db": "city__departement__name", "type": "index"},
            {
                "name": "Région",
                "db": "city__departement__region__name",
                "type": "index",
            },
            {"name": "Année", "db": "year", "type": "columns"},
            {"name": "Changement", "db": "household_change", "type": "values"},
            {"name": "Total", "db": "household", "type": "values"},
        ]
        qs = CommunePop.objects.filter(city__in=self.project.cities.all())
        df = self.generate_dataframe(config, qs)
        df.to_excel(self.writer, sheet_name="Ménages")

    def add_conso_sheet(self):
        """
        Onglet 3:  Consommation d'espace
            Code insee de la commune
            Nom de la commune
            Nom de l'epci
            Nom du SCoT
            Nom du département
            Nom de la région
            Pour chaque année:
                consommation total      naf09art10  Consommation total 2009
                consommation habitation art09hab10  Consommation habitation 2009
                consommation activité   art09act10  Consommation activité 2009
                conso mixte             art09mix10  Consommation mixte 2009
                conso inconnue          art09inc10  Consommation inconnue 2009
        """
        config = {
            "Commune": "city_name",
            "Insee": "city_insee",
            "EPCI": "epci_name",
            # "SCoT": "city__scot__name",
            "Département": "dept_name",
            "Région": "region_name",
        }
        for i in range(
            int(self.project.analyse_start_date) - 2000,
            int(self.project.analyse_end_date) - 2000 + 1,
        ):
            config.update(
                {
                    f"Consommation_totale_20{i:0>2}": f"naf{i:0>2}art{i+1:0>2}",
                    f"Consommation_habitation_20{i:0>2}": f"art{i:0>2}hab{i+1:0>2}",
                    f"Consommation_activité_20{i:0>2}": f"art{i:0>2}act{i+1:0>2}",
                    f"Consommation_mixte_20{i:0>2}": f"art{i:0>2}mix{i+1:0>2}",
                    f"Consommation_inconnue_20{i:0>2}": f"art{i:0>2}inc{i+1:0>2}",
                }
            )
        qs = (
            Cerema.objects.filter(city_insee__in=self.project.cities.values("insee"))
            .annotate(**{k: F(v) for k, v in config.items()})
            .values(*config.keys())
        )
        df = pd.DataFrame(qs, columns=config.keys()).fillna(0.0)
        df.to_excel(self.writer, sheet_name="Conso d'espace")
