from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)
from project.models import Project
from public_data.models import LandConso


class ObjectiveChart(DiagnosticChart):
    """
    Graphique trajectoire de consommation par rapport à l'objectif 2031.
    """

    name = "suivi de l'objectif"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": ""},
            "yAxis": [
                {
                    "title": {"text": "Consommation cumulée (en ha)"},
                    "labels": {"format": "{value} Ha"},
                    "opposite": True,
                },
                {
                    "title": {"text": "Consommation annuelle"},
                    "labels": {"format": "{value} Ha"},
                    "min": 0,
                },
            ],
            "xAxis": {
                "type": "category",
                "categories": [str(i) for i in range(2021, 2031)],
            },
            "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "top"},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "series": self.series,
        }

    @property
    def series(self):
        target_national = 50
        target_custom = float(self.params.get("target_2031_custom", 50))
        has_custom_target = target_custom != target_national

        series = [
            {
                "name": "Conso. annuelle réelle",
                "yAxis": 1,
                "data": list(),
                "color": "#D9D9D9",
                "zIndex": 6,
            },
            {
                "name": "Conso. cumulée réelle",
                "data": list(),
                "type": "line",
                "color": "#D9D9D9",
                "zIndex": 5,
            },
            {
                "name": "Objectif national annuel (50%)",
                "yAxis": 1,
                "data": list(),
                "color": "#b6c1ea",
                "zIndex": 4,
            },
            {
                "name": "Objectif national cumulé (50%)",
                "data": list(),
                "type": "line",
                "dashStyle": "ShortDash",
                "color": "#b6c1ea",
                "zIndex": 3,
            },
        ]

        if has_custom_target:
            series.extend(
                [
                    {
                        "name": f"Objectif personnalisé annuel ({target_custom}%)",
                        "yAxis": 1,
                        "data": list(),
                        "color": "#B6DFDE",
                        "zIndex": 2,
                    },
                    {
                        "name": f"Objectif personnalisé cumulé ({target_custom}%)",
                        "data": list(),
                        "type": "line",
                        "dashStyle": "Dash",
                        "color": "#B6DFDE",
                        "zIndex": 1,
                    },
                ]
            )

        total_real = 0
        total_2020 = 0

        conso_data = LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            year__gte=2011,
            year__lte=2023,
        ).order_by("year")

        for item in conso_data:
            # Conversion m² -> ha
            val = item.total / 10000

            if item.year <= 2020:
                total_2020 += val
            if item.year >= 2021:
                total_real += val
                series[1]["data"].append(
                    {
                        "name": str(item.year),
                        "y": total_real,
                        "progression": val,
                    }
                )
                series[0]["data"].append({"name": str(item.year), "y": val})

        annual_2020 = total_2020 / 10.0

        # Calcul de la trajectoire nationale (50%)
        annual_objective_national = annual_2020 - (annual_2020 / 100.0 * target_national)
        total_2031_national = total_2020

        for year in range(2021, 2031):
            total_2031_national += annual_objective_national
            series[3]["data"].append(
                {
                    "name": str(year),
                    "y": total_2031_national,
                    "progression": annual_objective_national,
                }
            )
            series[2]["data"].append({"name": str(year), "y": annual_objective_national})

        # Calcul de la trajectoire personnalisée si elle existe
        if has_custom_target:
            annual_objective_custom = annual_2020 - (annual_2020 / 100.0 * target_custom)
            total_2031_custom = total_2020

            for year in range(2021, 2031):
                total_2031_custom += annual_objective_custom
                series[5]["data"].append(
                    {
                        "name": str(year),
                        "y": total_2031_custom,
                        "progression": annual_objective_custom,
                    }
                )
                series[4]["data"].append({"name": str(year), "y": annual_objective_custom})

        return series

    @property
    def data_table(self):
        target_custom = float(self.params.get("target_2031_custom", 50))
        has_custom_target = target_custom != 50

        headers = [
            "Année",
            "Conso. annuelle réelle (ha)",
            "Conso. cumulée réelle (ha)",
            "Objectif national annuel (ha)",
            "Objectif national cumulé (ha)",
        ]

        if has_custom_target:
            headers.extend(
                [
                    "Objectif personnalisé annuel (ha)",
                    "Objectif personnalisé cumulé (ha)",
                ]
            )

        real = {_["name"]: _["y"] for _ in self.series[0]["data"]}
        added_real = {_["name"]: _["y"] for _ in self.series[1]["data"]}
        objective_national = {_["name"]: _["y"] for _ in self.series[2]["data"]}
        added_objective_national = {_["name"]: _["y"] for _ in self.series[3]["data"]}

        years = set(real.keys()) | set(objective_national.keys()) | set(added_real.keys())
        years |= set(added_objective_national.keys())

        rows = []
        for year in sorted(years):
            row_data = [
                year,
                real.get(year, "-"),
                added_real.get(year, "-"),
                objective_national.get(year, "-"),
                added_objective_national.get(year, "-"),
            ]

            if has_custom_target:
                objective_custom = {_["name"]: _["y"] for _ in self.series[4]["data"]}
                added_objective_custom = {_["name"]: _["y"] for _ in self.series[5]["data"]}
                row_data.extend(
                    [
                        objective_custom.get(year, "-"),
                        added_objective_custom.get(year, "-"),
                    ]
                )

            rows.append({"name": year, "data": row_data})

        return {"headers": headers, "rows": rows}


class ObjectiveChartExport(ObjectiveChart):
    """
    Version Export pour les rapports Word/PDF.
    Hérite de ObjectiveChart pour avoir exactement le même rendu.
    Adapte juste le constructeur pour accepter un Project au lieu de (land, params).
    """

    def __init__(self, project: Project, **kwargs):
        """
        Constructeur compatible avec l'export Word qui attend un Project.
        """
        # Convertir le Project en paramètres pour ObjectiveChart
        land = project.land_model
        params = {"target_2031_custom": float(project.target_2031) if project.target_2031 else 50}

        super().__init__(land=land, params=params)

        self.project = project

    # Propriétés nécessaires pour l'export Word
    @property
    def total_2020(self):
        """Consommation totale de la période de référence 2011-2020"""
        conso_data = LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            year__gte=2011,
            year__lte=2020,
        )
        return sum(item.total / 10000 for item in conso_data)  # Conversion m² -> ha

    @property
    def annual_2020(self):
        """Consommation annuelle moyenne de la période de référence"""
        return self.total_2020 / 10.0

    @property
    def annual_objective_2031(self):
        """Consommation annuelle objectif pour 2021-2031"""
        target = float(self.project.target_2031) if self.project.target_2031 else 50
        return self.annual_2020 - (self.annual_2020 * (target / 100.0))

    @property
    def conso_2031(self):
        """Consommation totale autorisée pour 2021-2031"""
        return self.annual_objective_2031 * 10.0

    @property
    def total_real(self):
        """Consommation réelle depuis 2021"""
        conso_data = LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            year__gte=2021,
        )
        return sum(item.total / 10000 for item in conso_data)  # Conversion m² -> ha
