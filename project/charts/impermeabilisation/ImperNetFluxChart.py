from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    ARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_NETTE_COLOR,
    DEFAULT_VALUE_DECIMALS,
    DESARTIFICIALISATION_COLOR,
)
from public_data.models.impermeabilisation import LandImperFlux, LandImperFluxIndex


class ImperNetFluxChart(DiagnosticChart):
    name = "Evolution de l'artificialisation"

    def __init__(self, land, params):
        """
        Initialise le graphique de flux net d'imperméabilisation.

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
    def data(self) -> LandImperFluxIndex | LandImperFlux | None:
        if self.params.get("departement"):
            return LandImperFlux.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
                departement=self.params.get("departement"),
            ).first()
        else:
            return LandImperFluxIndex.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
            ).first()

    @property
    def series(self):
        # Si toutes les valeurs sont à 0, retourner None pour déclencher noData
        if self.data.flux_imper == 0 and self.data.flux_desimper == 0 and self.data.flux_imper_net == 0:
            return None

        return [
            {
                "data": [
                    {
                        "name": "Imperméabilisation",
                        "y": self.data.flux_imper,
                        "color": ARTIFICIALISATION_COLOR,
                    },
                    {
                        "name": "Désimperméabilisation",
                        "y": self.data.flux_desimper * -1,
                        "color": DESARTIFICIALISATION_COLOR,
                    },
                    {
                        "name": "Imperméabilisation nette",
                        "y": self.data.flux_imper_net,
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
            "title": {"text": f"Imperméabilisation nette{self.title_end}"},
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
            "lang": {"noData": "Aucun changement du sol n'est à l'origine d'imperméabilisation sur cette période."},
            "noData": {"style": {"fontWeight": "bold", "fontSize": "15px", "color": "#303030", "textAlign": "center"}},
        }

    @property
    def year_or_index_period(self):
        """Retourne la période de flux (millésime ancien et nouveau)"""
        if self.params.get("departement"):
            # Pour LandImperFlux, on a year_old et year_new
            return f"{self.data.year_old}-{self.data.year_new}"
        elif self.land.is_interdepartemental:
            return f"millésime {self.params.get('millesime_old_index')}-{self.params.get('millesime_new_index')}"
        else:
            # Pour LandImperFluxIndex, on a years_old et years_new
            return f"{self.data.years_old[0]}-{self.data.years_new[-1]}"

    @property
    def data_table(self):
        headers = [
            f"Imperméabilisation (ha) - {self.year_or_index_period}",
            f"Désimperméabilisation (ha) - {self.year_or_index_period}",
            f"Imperméabilisation nette (ha) - {self.year_or_index_period}",
        ]

        return {
            "headers": headers,
            "rows": [
                {
                    "name": "",  # not used
                    "data": [
                        round(self.data.flux_imper, DEFAULT_VALUE_DECIMALS),
                        round(self.data.flux_desimper, DEFAULT_VALUE_DECIMALS),
                        round(self.data.flux_imper_net, DEFAULT_VALUE_DECIMALS),
                    ],
                }
            ],
        }
