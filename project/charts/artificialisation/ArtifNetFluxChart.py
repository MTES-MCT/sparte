from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    ARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_NETTE_COLOR,
    DEFAULT_VALUE_DECIMALS,
    DESARTIFICIALISATION_COLOR,
)
from public_data.models import AdminRef
from public_data.models.artificialisation import LandArtifFlux, LandArtifFluxIndex


class ArtifNetFluxChart(DiagnosticChart):
    name = "Evolution de l'artificialisation"

    def __init__(self, land, params):
        """
        Initialise le graphique de flux net d'artificialisation.

        Deux modes de paramètres sont possibles :
        1. Mode standard : params doit contenir 'millesime_new_index' et 'millesime_old_index'
        2. Mode département : params doit contenir 'millesime_new_index', 'millesime_old_index' ET 'departement'

        Args:
            land: Instance de LandModel représentant le territoire
            params: Dictionnaire de paramètres avec les clés requises

        Raises:
            ValueError: Si les paramètres requis ne sont pas présents
        """
        # Vérification des paramètres obligatoires
        if "millesime_new_index" not in params:
            raise ValueError("Le paramètre 'millesime_new_index' est obligatoire")

        if "millesime_old_index" not in params:
            raise ValueError("Le paramètre 'millesime_old_index' est obligatoire")

        # Appel du constructeur parent
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
            return f" ({self.params.get('departement')})"

        if self.land.is_interdepartemental:
            return f" entre le millésime {self.params.get('millesime_old_index')} et le millésime {self.params.get('millesime_new_index')}"  # noqa: E501
        else:
            return f" entre {self.data.years_old[0]} et {self.data.years_new[-1]}"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": f"Evolution de l'artificialisation nette{self.title_end}"},
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
        }

    @property
    def year_or_index_after(self):
        if self.land.is_interdepartemental:
            return f"millésime {self.params.get('millesime_new_index')}"
        return f"{self.data.years_new[-1]}"

    @property
    def data_table(self):
        if self.params.get("departement"):
            territory_header = "Département"
            territory_name = self.params.get("departement")
        else:
            territory_header = AdminRef.get_label(self.land.land_type)
            territory_name = self.land.name

        headers = [
            territory_header,
            f"Artificialisation (ha) - {self.year_or_index_after}",
            f"Désartificialisation (ha) - {self.year_or_index_after}",
            f"Artificialisation nette (ha) - {self.year_or_index_after}",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [
                        territory_name,
                        round(self.data.flux_artif, DEFAULT_VALUE_DECIMALS),
                        round(self.data.flux_desartif, DEFAULT_VALUE_DECIMALS),
                        round(self.data.flux_artif_net, DEFAULT_VALUE_DECIMALS),
                    ],
                }
            ],
        }
