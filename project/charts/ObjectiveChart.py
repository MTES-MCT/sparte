from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)
from public_data.models import LandConso


class ObjectiveChart(DiagnosticChart):
    """
    Graphique trajectoire de consommation par rapport à l'objectif 2031.
    """

    name = "suivi de l'objectif"

    @classmethod
    def validate_target(cls, value) -> float:
        """Valide et retourne un objectif comme float entre 0 et 100."""
        try:
            target = float(value)
        except (TypeError, ValueError):
            raise ValueError(f"L'objectif doit être un nombre, reçu: {value}")

        if not 0 <= target <= 100:
            raise ValueError(f"L'objectif doit être entre 0 et 100, reçu: {target}")

        return target

    @property
    def target_2031_custom(self) -> float | None:
        """Retourne la valeur validée de target_2031_custom ou None si non fourni."""
        value = self.params.get("target_2031_custom")
        if value is None or value == "":
            return None
        return self.validate_target(value)

    @property
    def _territorialisation_data(self) -> dict:
        """Cache les données de territorialisation pour éviter les appels multiples."""
        if not hasattr(self, "_cached_territorialisation"):
            self._cached_territorialisation = self.land.territorialisation
        return self._cached_territorialisation

    @property
    def target_territorialise(self) -> float | None:
        """Récupère l'objectif territorialisé (propre ou hérité d'un parent)."""
        return self._territorialisation_data.get("objectif")

    @property
    def has_territorialisation(self) -> bool:
        """Retourne True si un objectif territorialisé ou suggéré est défini."""
        return self._territorialisation_data.get("has_objectif", False)

    @property
    def is_from_parent(self) -> bool:
        """Retourne True si l'objectif est hérité d'un territoire parent (suggéré)."""
        return self._territorialisation_data.get("is_from_parent", False)

    @property
    def conso_2011_2020(self) -> float:
        """Calcule la consommation cumulée 2011-2020 en hectares."""
        conso_data = LandConso.objects.filter(
            land_id=self.land.land_id,
            land_type=self.land.land_type,
            year__gte=2011,
            year__lte=2020,
        )
        return sum(item.total / 10000 for item in conso_data)

    @property
    def conso_max_reference(self) -> float:
        """Calcule la consommation maximale autorisée selon l'objectif de référence."""
        target = self.target_territorialise if self.has_territorialisation else 50
        return self.conso_2011_2020 * (1 - target / 100)

    @property
    def conso_max_custom(self) -> float | None:
        """Calcule la consommation maximale autorisée selon l'objectif personnalisé."""
        if self.target_2031_custom is None:
            return None
        return self.conso_2011_2020 * (1 - self.target_2031_custom / 100)

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
            "legend": {"layout": "horizontal", "align": "center", "verticalAlign": "bottom", "symbolRadius": 0},
            "plotOptions": {"column": {"borderRadius": 0}, "line": {"marker": {"enabled": False}}},
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
        # Objectif de référence : territorialisé (réglementaire) ou national (50%)
        target_reference = self.target_territorialise if self.has_territorialisation else 50
        target_custom = self.target_2031_custom
        has_custom_target = target_custom is not None and target_custom != target_reference

        # Couleurs et labels selon le type d'objectif
        if self.has_territorialisation:
            if self.is_from_parent:
                reference_label = f"suggéré ({target_reference}%)"
            else:
                reference_label = f"réglementaire ({target_reference}%)"
            color_bar = "#A558A0"  # Violet
            color_line = "#8B4789"  # Violet foncé
        else:
            reference_label = "national (50%)"
            color_bar = "#b6c1ea"  # Bleu
            color_line = "#8c9ace"  # Bleu foncé

        series = [
            {
                "name": "Consommation annuelle réelle",
                "yAxis": 1,
                "data": list(),
                "color": "#D9D9D9",
                "zIndex": 3,
            },
            {
                "name": "Consommation cumulée réelle",
                "data": list(),
                "type": "line",
                "color": "#b5b5b5",
                "zIndex": 6,
            },
            {
                "name": f"Consommation annuelle selon objectif {reference_label}",
                "yAxis": 1,
                "data": list(),
                "color": color_bar,
                "zIndex": 2,
            },
            {
                "name": f"Consommation cumulée selon objectif {reference_label}",
                "data": list(),
                "type": "line",
                "dashStyle": "ShortDash",
                "color": color_line,
                "zIndex": 5,
            },
        ]

        if has_custom_target:
            series.extend(
                [
                    {
                        "name": f"Consommation annuelle selon objectif personnalisé ({target_custom}%)",
                        "yAxis": 1,
                        "data": list(),
                        "color": "#B6DFDE",
                        "zIndex": 1,
                    },
                    {
                        "name": f"Consommation cumulée selon objectif personnalisé ({target_custom}%)",
                        "data": list(),
                        "type": "line",
                        "dashStyle": "Dash",
                        "color": "#98cecc",
                        "zIndex": 4,
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

        # Calcul de la trajectoire de référence (territorialisée ou nationale)
        annual_objective_reference = annual_2020 - (annual_2020 / 100.0 * target_reference)
        total_2031_reference = 0

        for year in range(2021, 2031):
            total_2031_reference += annual_objective_reference
            series[3]["data"].append(
                {
                    "name": str(year),
                    "y": total_2031_reference,
                    "progression": annual_objective_reference,
                }
            )
            series[2]["data"].append({"name": str(year), "y": annual_objective_reference})

        # Calcul de la trajectoire personnalisée si elle existe
        if has_custom_target:
            annual_objective_custom = annual_2020 - (annual_2020 / 100.0 * target_custom)
            total_2031_custom = 0

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
        target_reference = self.target_territorialise if self.has_territorialisation else 50
        target_custom = self.target_2031_custom
        has_custom_target = target_custom is not None and target_custom != target_reference

        if self.has_territorialisation:
            if self.is_from_parent:
                reference_label = f"suggéré ({target_reference}%)"
            else:
                reference_label = f"réglementaire ({target_reference}%)"
        else:
            reference_label = "national (50%)"

        headers = [
            "Année",
            "Consommation annuelle réelle (ha)",
            "Consommation cumulée réelle (ha)",
            f"Consommation annuelle selon objectif {reference_label} (ha)",
            f"Consommation cumulée selon objectif {reference_label} (ha)",
        ]

        if has_custom_target:
            headers.extend(
                [
                    f"Consommation annuelle selon objectif personnalisé ({target_custom}%) (ha)",
                    f"Consommation cumulée selon objectif personnalisé ({target_custom}%) (ha)",
                ]
            )

        real = {_["name"]: _["y"] for _ in self.series[0]["data"]}
        added_real = {_["name"]: _["y"] for _ in self.series[1]["data"]}
        objective_reference = {_["name"]: _["y"] for _ in self.series[2]["data"]}
        added_objective_reference = {_["name"]: _["y"] for _ in self.series[3]["data"]}

        years = set(real.keys()) | set(objective_reference.keys()) | set(added_real.keys())
        years |= set(added_objective_reference.keys())

        rows = []
        for year in sorted(years):
            row_data = [
                year,
                real.get(year, "-"),
                added_real.get(year, "-"),
                objective_reference.get(year, "-"),
                added_objective_reference.get(year, "-"),
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
    """Version Export avec un titre différent."""

    @property
    def param(self):
        return super().param | {
            "title": {
                "text": f"Trajectoire de consommation d'espaces NAF à {self.land.name} entre 2021 et 2031 (en ha)"
            },
            "credits": CEREMA_CREDITS,
        }
