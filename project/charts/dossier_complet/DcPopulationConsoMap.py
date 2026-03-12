from public_data.models import AdminRef

from .DcBivariateConsoMap import DcBivariateConsoMap


class DcPopulationConsoMap(DcBivariateConsoMap):
    name = "dc population conso map"
    indicator_key = "population"
    indicator_name = "Évolution de la population"
    indicator_short = "évolution annuelle population"
    indicator_unit = "%"
    indicator_gender = "f"

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
            (
                "Situation la plus défavorable : forte consommation d'espaces "
                "sans dynamique démographique pour la justifier."
            ),
            "Situation défavorable : forte consommation d'espaces pour une croissance démographique limitée.",
            (
                "Situation contrastée : la forte consommation d'espaces "
                "s'accompagne d'une dynamique démographique soutenue."
            ),
        ],
    ]

    @property
    def _population_fields(self):
        """Return (start_field, end_field) for the population model based on period."""
        s, e = self.start_date, self.end_date
        if e <= 2016:
            return "population_11", "population_16"
        if s >= 2016:
            return "population_16", "population_22"
        return "population_11", "population_22"

    @property
    def data_table(self):
        """Extended data table with population start/end values."""
        land_names = {land.land_id: land.name for land in self.lands}
        labels = self._category_labels

        def fmt(v):
            return f"{v:,.0f}" if v is not None else "-"

        return {
            "headers": [
                AdminRef.get_label(self.child_land_type),
                "Évolution de la population (%/an)",
                f"Consommation {self.start_date}-{self.end_date} (ha/an)",
                "Catégorie",
            ],
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": "",
                    "data": [
                        land_names.get(d["land_id"], d["land_id"]),
                        d["indic_fmt"],
                        d["conso_fmt"],
                        labels[d["category_id"]],
                    ],
                }
                for d in self.data
            ],
        }
