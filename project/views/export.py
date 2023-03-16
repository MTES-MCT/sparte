import io
import re
from datetime import datetime

import pandas as pd
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import CharField, F, Sum, Value
from django.db.models.functions import Concat
from django.http import FileResponse
from django.views.generic import TemplateView, View

from project.models.project_base import Project
from project.storages import ExportStorage

# from utils.excel import write_sheet
from public_data.models import Cerema, CommuneDiff, CommunePop, CommuneSol


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


class ExportExcelView(View):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.project = None
        self.writer = None
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

    def get_excel_as_buffer(self) -> io.BytesIO:
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as self.writer:
            self.add_population_sheet()
            self.add_menages_sheet()
            self.add_conso_sheet()
            if self.project.is_artif():
                self.add_artif_sheet()
                self.add_detail_artif_sheet()
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
        df.astype(float).to_excel(self.writer, sheet_name="Ménages")

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
            "SCoT": "scot",
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
        df = df.set_index(["Commune", "Insee", "EPCI", "SCoT", "Département", "Région"])
        df.astype(float).to_excel(self.writer, sheet_name="Conso d'espace")

    def add_artif_sheet(self):
        """
        Onglet 4 (si dispo) : Artificialisation
            Code insee de la commune
            Nom de la commune
            Nom de l'epci
            (si dispo) Nom du SCoT
            Nom du département
            Nom de la région
            Plus ancien millésime
            Plus récent millésime
            Surface artificielle dernier millésime
            Pour chaque différentiel (entre 2 millésimes) :
                artificialisation
                renaturation
                artificialisation nette
                taux d'artificialisation nette (artif nette / surface du territoire)
        """
        # config = [
        #     {"name": "Commune", "db": "city__name", "type": "index"},
        #     {"name": "Insee", "db": "city__insee", "type": "index"},
        #     {"name": "EPCI", "db": "city__epci__name", "type": "index"},
        #     {"name": "SCoT", "db": "city__scot__name", "type": "index"},
        #     {"name": "Département", "db": "city__departement__name", "type": "index"},
        #     {
        #         "name": "Région",
        #         "db": "city__departement__region__name",
        #         "type": "index",
        #     },
        #     {"name": "Surface_artificielle_dernier_millésime", "db": Sum("surface"), "type": "values"},
        #     {"name": "Différentiel", "db": Value(self.project.analyse_end_date), "type": "columns"},
        # ]
        qs = (
            CommuneSol.objects.filter(
                city__in=self.project.cities.all(), matrix__is_artificial=True
            )
            .annotate(
                Commune=F("city__name"),
                Insee=F("city__insee"),
                EPCI=F("city__epci__name"),
                SCoT=F("city__scot__name"),
                Département=F("city__departement__name"),
                Région=F("city__departement__region__name"),
            )
            .values("Commune", "Insee", "EPCI", "SCoT", "Département", "Région")
            .annotate(
                {
                    "Surface artificielle dernier millésime": Sum("surface"),
                    "Différentiel": Value(self.project.last_year_ocsge),
                }
            )
            .order_by("Commune", "Insee", "EPCI", "SCoT", "Département", "Région")
        )
        df = (
            pd.DataFrame(
                qs,
                columns=[
                    "Commune",
                    "Insee",
                    "EPCI",
                    "SCoT",
                    "Département",
                    "Région",
                    "Différentiel",
                    "Surface artificielle dernier millésime",
                ],
            )
            .fillna(0.0)
            .pivot(
                columns=["Différentiel"],
                index=["Commune", "Insee", "EPCI", "SCoT", "Département", "Région"],
                values=["Surface artificielle dernier millésime"],
            )
        )
        qs2 = (
            CommuneDiff.objects.filter(city__in=self.project.cities.all())
            .filter(year_old__gte=self.project.analyse_start_date)
            .filter(year_old__lte=self.project.analyse_end_date)
            .annotate(
                Commune=F("city__name"),
                Insee=F("city__insee"),
                EPCI=F("city__epci__name"),
                SCoT=F("city__scot__name"),
                Département=F("city__departement__name"),
                Région=F("city__departement__region__name"),
                Différentiel=Concat(
                    "year_old", Value("-"), "year_new", output_field=CharField()
                ),
                Artificialisation=F("new_artif"),
                Renaturation=F("new_natural"),
                Artificialisation_nette=F("net_artif"),
            )
            .values(
                "Commune",
                "Insee",
                "EPCI",
                "SCoT",
                "Département",
                "Région",
                "Différentiel",
                "Artificialisation",
                "Renaturation",
                "Artificialisation_nette",
            )
        )
        df2 = (
            pd.DataFrame(
                qs2,
                columns=[
                    "Commune",
                    "Insee",
                    "EPCI",
                    "SCoT",
                    "Département",
                    "Région",
                    "Différentiel",
                    "Artificialisation",
                    "Renaturation",
                    "Artificialisation_nette",
                ],
            )
            .fillna(0.0)
            .pivot(
                columns=["Différentiel"],
                index=["Commune", "Insee", "EPCI", "SCoT", "Département", "Région"],
                values=[
                    "Artificialisation",
                    "Renaturation",
                    "Artificialisation_nette",
                ],
            )
        )
        df = df.merge(df2, left_index=True, right_index=True)
        df.astype(float).to_excel(self.writer, sheet_name="Artificialisation")

    def add_detail_artif_sheet(self):
        """Onglet 5 (si dispo) : Détail de l'artificialisation
        Code insee de la commune
        Nom de la commune
        Nom de l'epci
        (si dispo) Nom du SCoT
        Nom du département
        Nom de la région
        Plus ancien millésime
        Plus récent millésime
        pour chaque couverture clé:
            Artificialisation
            Renaturation
        Pour chaque usage clé:
            Artificialisation
            Renaturation
        """
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
            {
                "name": "Code",
                "db": "matrix__couverture__code_prefix",
                "type": "columns",
            },
            {
                "name": "Libellé",
                "db": "matrix__couverture__label_short",
                "type": "columns",
            },
        ]
        qs1 = (
            CommuneSol.objects.filter(
                city__in=self.project.cities.all(),
                year__gte=self.project.analyse_start_date,
                year__lte=self.project.analyse_end_date,
            )
            .annotate(**{_["name"]: F(_["db"]) for _ in config})
            .values(*[_["name"] for _ in config])
            .annotate(surface=Sum("surface"))
            .order_by(*[_["name"] for _ in config])
        )
        # usage
        config[7] = {
            "name": "Code",
            "db": "matrix__usage__code_prefix",
            "type": "columns",
        }
        config[8] = {
            "name": "Libellé",
            "db": "matrix__usage__label_short",
            "type": "columns",
        }
        qs2 = (
            CommuneSol.objects.filter(
                city__in=self.project.cities.all(),
                year__gte=self.project.analyse_start_date,
                year__lte=self.project.analyse_end_date,
            )
            .annotate(**{_["name"]: F(_["db"]) for _ in config})
            .values(*[_["name"] for _ in config])
            .annotate(surface=Sum("surface"))
            .order_by(*[_["name"] for _ in config])
        )
        qs = qs1.union(qs2)
        df = (
            pd.DataFrame(qs, columns=["surface"] + [_["name"] for _ in config])
            .pivot(
                columns=[_["name"] for _ in config if _["type"] == "columns"],
                index=[_["name"] for _ in config if _["type"] == "index"],
                values=["surface"],
            )
            .fillna(0.0)
        )
        cols = sorted(list(df.columns.values), key=lambda x: f"{x[1]}{x[2]}")
        df = df[cols]
        df.astype(float).to_excel(self.writer, sheet_name="Couverture et usage")
