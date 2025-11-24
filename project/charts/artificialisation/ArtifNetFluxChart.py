from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    ARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_NETTE_COLOR,
    DEFAULT_VALUE_DECIMALS,
    DESARTIFICIALISATION_COLOR,
    OCSGE_CREDITS,
)
from public_data.models.administration import Departement
from public_data.models.artificialisation import LandArtifFlux, LandArtifFluxIndex


class ArtifNetFluxChart(DiagnosticChart):
    name = "Artificialisation"
    required_params = ["millesime_new_index", "millesime_old_index"]

    def __init__(self, land, params):
        super().__init__(land=land, params=params)

    @property
    def data(self) -> LandArtifFluxIndex | LandArtifFlux | None:
        if self.params.get("departement"):
            return LandArtifFlux.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
                departement=self.params.get("departement"),
            ).first()
        else:
            return LandArtifFluxIndex.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
            ).first()

    @property
    def series(self):
        # Si toutes les valeurs sont à 0, retourner None pour déclencher noData
        if self.data.flux_artif == 0 and self.data.flux_desartif == 0 and self.data.flux_artif_net == 0:
            return None

        return [
            {
                "data": [
                    {
                        "name": "Artificialisation",
                        "y": self.data.flux_artif,
                        "color": ARTIFICIALISATION_COLOR,
                    },
                    {
                        "name": "Désartificialisation",
                        "y": self.data.flux_desartif * -1,
                        "color": DESARTIFICIALISATION_COLOR,
                    },
                    {
                        "name": "Artificialisation nette",
                        "y": self.data.flux_artif_net,
                        "color": ARTIFICIALISATION_NETTE_COLOR,
                    },
                ],
            }
        ]

    @cached_property
    def title_end(self):
        if self.params.get("departement"):
            # Afficher les années avec le département
            # Pour LandArtifFlux, on a year_old et year_new (singular)
            departement_code = self.params.get("departement")
            try:
                departement = Departement.objects.get(source_id=departement_code)
                departement_label = f"{departement_code} - {departement.name}"
            except Departement.DoesNotExist:
                departement_label = departement_code
            years_info = f" entre {self.data.year_old} et {self.data.year_new}"
            return f"{years_info} ({departement_label})"

        if self.land.is_interdepartemental:
            return f" entre le millésime {self.params.get('millesime_old_index')} et le millésime {self.params.get('millesime_new_index')}"  # noqa: E501
        else:
            return f" entre {self.data.years_old[0]} et {self.data.years_new[-1]}"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Artificialisation nette{self.title_end}"},
            "yAxis": {
                "title": {"text": "Surface (en ha)"},
            },
            "tooltip": {
                "pointFormat": "{point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "xAxis": {"type": "category"},
            "legend": {"enabled": False},
            "plotOptions": {
                "column": {
                    "dataLabels": {"enabled": True, "format": "{point.y:,.1f}"},
                    "pointPadding": 0.2,
                    "borderWidth": 0,
                }
            },
            "series": self.series,
            "lang": {"noData": "Aucun changement du sol n'est à l'origine d'artificialisation sur cette période."},
            "noData": {"style": {"fontWeight": "bold", "fontSize": "15px", "color": "#303030", "textAlign": "center"}},
        }

    @property
    def year_or_index_period(self):
        """Retourne la période de flux (millésime ancien et nouveau)"""
        if self.params.get("departement"):
            # Pour LandArtifFlux, on a year_old et year_new
            return f"{self.data.year_old}-{self.data.year_new}"
        elif self.land.is_interdepartemental:
            return f"millésime {self.params.get('millesime_old_index')}-{self.params.get('millesime_new_index')}"
        else:
            # Pour LandArtifFluxIndex, on a years_old et years_new
            return f"{self.data.years_old[0]}-{self.data.years_new[-1]}"

    @property
    def data_table(self):
        headers = [
            f"Artificialisation (ha) - {self.year_or_index_period}",
            f"Désartificialisation (ha) - {self.year_or_index_period}",
            f"Artificialisation nette (ha) - {self.year_or_index_period}",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [
                        round(self.data.flux_artif, DEFAULT_VALUE_DECIMALS),
                        f"-{round(self.data.flux_desartif, DEFAULT_VALUE_DECIMALS)}",
                        round(self.data.flux_artif_net, DEFAULT_VALUE_DECIMALS),
                    ],
                }
            ],
        }


class ArtifNetFluxChartExport(ArtifNetFluxChart):
    """Version export du graphique de flux d'artificialisation nette"""

    @property
    def param(self):
        base_param = super().param
        return base_param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": f"{base_param['title']['text']} sur le territoire {self.land.name} (en ha)",
            },
            "tooltip": {"enabled": False},
            "plotOptions": {
                "column": {
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:,.1f}",
                        "style": {
                            "fontSize": "11px",
                            "fontWeight": "bold",
                        },
                    },
                    "pointPadding": 0.2,
                    "borderWidth": 0,
                }
            },
        }
