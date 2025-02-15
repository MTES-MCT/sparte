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
from public_data.models import CommuneDiff, CommuneSol


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
            content_type=("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;" "charset=utf-8"),
            as_attachment=True,
            filename=f"données du diagnostic {self.project.territory_name}.xlsx",
        )

    def get_excel_as_buffer(self) -> io.BytesIO:
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as self.writer:
            if self.project.ocsge_coverage_status == self.project.OcsgeCoverageStatus.COMPLETE_UNIFORM:
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
        annotations = {_["name"]: F(_["db"]) for _ in config}
        headers = [_["name"] for _ in config]
        columns = [_["name"] for _ in config if _["type"] == "columns"]
        index = [_["name"] for _ in config if _["type"] == "index"]
        values = [_["name"] for _ in config if _["type"] == "values"]
        # get data formated from queryset
        qs = queryset.annotate(**annotations).values(*headers)
        # add data to dataframe and make the pivot
        df = pd.DataFrame(qs, columns=headers).fillna(0.0).pivot(columns=columns, index=index, values=values)
        return df

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
                désartificialisation
                artificialisation nette
                taux d'artificialisation nette (artif nette / surface du territoire)
        """
        config = [
            {"name": "Insee", "db": F("city__insee"), "type": "index"},
            {"name": "Commune", "db": F("city__name"), "type": "index"},
            {"name": "EPCI", "db": F("city__epci__name"), "type": "index"},
            {"name": "SCoT", "db": F("city__scot__name"), "type": "index"},
            {
                "name": "Département",
                "db": F("city__departement__name"),
                "type": "index",
            },
            {
                "name": "Région",
                "db": F("city__departement__region__name"),
                "type": "index",
            },
            {
                "name": "Plus_ancien_millésime",
                "db": Value(self.project.first_year_ocsge),
                "type": "index",
            },
            {
                "name": "Plus_récent_millésime",
                "db": Value(self.project.last_year_ocsge),
                "type": "index",
            },
            {
                "name": "Différentiel",
                "db": Value(self.project.last_year_ocsge),
                "type": "columns",
            },
        ]
        qs = (
            CommuneSol.objects.filter(
                city__in=self.project.cities.all(),
                matrix__is_artificial=True,
                year=self.project.last_year_ocsge,
            )
            .annotate(**{_["name"]: _["db"] for _ in config})
            .values(*[_["name"] for _ in config])
            .annotate(Surface_artificielle_dernier_millésime=Sum("surface"))
            .order_by("Insee")
        )
        df = (
            pd.DataFrame(
                qs,
                columns=[
                    *[_["name"] for _ in config],
                    "Surface_artificielle_dernier_millésime",
                ],
            )
            .fillna(0.0)
            .pivot(
                columns=[_["name"] for _ in config if _["type"] == "columns"],
                index=[_["name"] for _ in config if _["type"] == "index"],
                values=["Surface_artificielle_dernier_millésime"],
            )
        )
        config[8]["db"] = Concat("year_old", Value("-"), "year_new", output_field=CharField())
        qs2 = (
            CommuneDiff.objects.filter(
                city__in=self.project.cities.all(),
                year_old__gte=self.project.analyse_start_date,
                year_old__lte=self.project.analyse_end_date,
            )
            .annotate(
                **{_["name"]: _["db"] for _ in config},
                Artificialisation=F("new_artif"),
                Désartificialisation=F("new_natural"),
                Artificialisation_nette=F("net_artif"),
            )
            .values(
                *[_["name"] for _ in config],
                "Artificialisation",
                "Désartificialisation",
                "Artificialisation_nette",
            )
        )
        df2 = (
            pd.DataFrame(qs2)
            .fillna(0.0)
            .pivot(
                columns=[_["name"] for _ in config if _["type"] == "columns"],
                index=[_["name"] for _ in config if _["type"] == "index"],
                values=[
                    "Artificialisation",
                    "Désartificialisation",
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
            Désartificialisation
        Pour chaque usage clé:
            Artificialisation
            Désartificialisation
        """
        config = [
            {"name": "Commune", "db": F("city__name"), "type": "index"},
            {"name": "Insee", "db": F("city__insee"), "type": "index"},
            {"name": "EPCI", "db": F("city__epci__name"), "type": "index"},
            {"name": "SCoT", "db": F("city__scot__name"), "type": "index"},
            {"name": "Département", "db": F("city__departement__name"), "type": "index"},
            {
                "name": "Région",
                "db": F("city__departement__region__name"),
                "type": "index",
            },
            {"name": "Année", "db": F("year"), "type": "columns"},
            {
                "name": "Code",
                "db": F("matrix__couverture__code_prefix"),
                "type": "columns",
            },
            {
                "name": "Libellé",
                "db": F("matrix__couverture__label_short"),
                "type": "columns",
            },
            {
                "name": "Plus_ancien_millésime",
                "db": Value(self.project.first_year_ocsge),
                "type": "index",
            },
            {
                "name": "Plus_récent_millésime",
                "db": Value(self.project.last_year_ocsge),
                "type": "index",
            },
        ]
        qs1 = (
            CommuneSol.objects.filter(
                city__in=self.project.cities.all(),
                year__gte=self.project.analyse_start_date,
                year__lte=self.project.analyse_end_date,
            )
            .annotate(**{_["name"]: _["db"] for _ in config})
            .values(*[_["name"] for _ in config])
            .annotate(surface=Sum("surface"))
            .order_by(*[_["name"] for _ in config])
        )
        # usage
        config[7] = {
            "name": "Code",
            "db": F("matrix__usage__code_prefix"),
            "type": "columns",
        }
        config[8] = {
            "name": "Libellé",
            "db": F("matrix__usage__label_short"),
            "type": "columns",
        }
        qs2 = (
            CommuneSol.objects.filter(
                city__in=self.project.cities.all(),
                year__gte=self.project.analyse_start_date,
                year__lte=self.project.analyse_end_date,
            )
            .annotate(**{_["name"]: _["db"] for _ in config})
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
