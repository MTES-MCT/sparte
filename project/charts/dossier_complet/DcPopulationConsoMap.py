from public_data.models import LandDcPopulation

from .DcBivariateConsoMap import DcBivariateConsoMap


class DcPopulationConsoMap(DcBivariateConsoMap):
    name = "dc population conso map"
    indicator_name = "Évolution de la population"
    indicator_short = "évol. pop."
    indicator_unit = "%"
    indicator_gender = "f"
    indicator_model = LandDcPopulation

    verdicts = [
        [
            "Situation favorable : peu de consommation d'espaces malgré une dynamique démographique modérée.",
            "Situation très favorable : peu de consommation d'espaces avec une croissance démographique correcte.",
            "Situation idéale : croissance démographique soutenue avec très peu de consommation d'espaces.",
        ],
        [
            "Situation contrastée : consommation modérée mais faible dynamique démographique.",
            "Situation intermédiaire : consommation et dynamique démographique dans la moyenne du territoire.",
            "Situation plutôt favorable : bonne dynamique démographique pour une consommation modérée.",
        ],
        [
            "Situation la plus défavorable : forte consommation d'espaces "
            "sans dynamique démographique pour la justifier.",
            "Situation défavorable : forte consommation d'espaces " "pour une croissance démographique limitée.",
            "Situation contrastée : la forte consommation d'espaces "
            "s'accompagne d'une dynamique démographique soutenue.",
        ],
    ]

    @property
    def period_years(self):
        s, e = self.start_date, self.end_date
        if e <= 2016:
            return ("population_11", "population_16", s, e)
        if s >= 2016:
            return ("population_16", "population_22", s, e)
        return ("population_11", "population_22", s, e)

    def compute_indicator_value(self, obj, start_field, end_field):
        if obj is None:
            return None
        start = getattr(obj, start_field, None)
        end = getattr(obj, end_field, None)
        if start and end and start > 0:
            return round((end - start) / start * 100, 2)
        return None

    def format_indicator(self, value):
        if value is None:
            return "n.d."
        return f"{value:+.1f}%"

    @property
    def data_table(self):
        """Extended data table with population start/end values."""
        _, _, conso_start, conso_end = self.period_years
        land_names = {land.land_id: land.name for land in self.lands}
        labels = self._category_labels()
        indic_start_field, indic_end_field, _, _ = self.period_years

        # Get population data for detailed columns
        indic_data = {
            obj.land_id: obj
            for obj in self.indicator_model.objects.filter(
                land_id__in=[land.land_id for land in self.lands],
                land_type=self.child_land_type,
            )
        }

        def fmt(v):
            return f"{v:,.0f}" if v is not None else "-"

        return {
            "headers": [
                AdminRef.get_label(self.child_land_type),
                "Pop. début",
                "Pop. fin",
                "Évolution pop.",
                f"Conso. {conso_start}-{conso_end} (ha)",
                "Catégorie",
            ],
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": "",
                    "data": [
                        land_names.get(d["land_id"], d["land_id"]),
                        fmt(getattr(indic_data.get(d["land_id"]), indic_start_field, None)),
                        fmt(getattr(indic_data.get(d["land_id"]), indic_end_field, None)),
                        d["indic_fmt"],
                        d["conso_fmt"],
                        labels[d["category_id"]],
                    ],
                }
                for d in self.data
            ],
        }

    def get_chart_title(self):
        _, _, conso_start, conso_end = self.period_years
        child_label = self.formatted_child_land_type
        container = self._container_land
        if self.land.land_type == AdminRef.COMMUNE:
            return (
                f"Population et consommation d'espaces des {child_label}s - "
                f"{self.land.name} ({container.name}, {conso_start}-{conso_end})"
            )
        return (
            f"Population et consommation d'espaces des {child_label}s - "
            f"{container.name} ({conso_start}-{conso_end})"
        )


# Needed for the import in data_table
from public_data.models import AdminRef  # noqa: E402
