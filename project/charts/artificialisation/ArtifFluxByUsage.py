from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    ARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_NETTE_COLOR,
    DEFAULT_VALUE_DECIMALS,
    DESARTIFICIALISATION_COLOR,
    LEGEND_NAVIGATION_EXPORT,
    OCSGE_CREDITS,
)
from public_data.models.administration import Departement
from public_data.models.artificialisation import (
    LandArtifFluxUsageComposition,
    LandArtifFluxUsageCompositionIndex,
)


class ArtifFluxByUsage(DiagnosticChart):
    name = "Artificialisation"
    sol = "usage"
    model = LandArtifFluxUsageCompositionIndex
    model_by_departement = LandArtifFluxUsageComposition

    def __init__(self, land, params):
        """
        Initialise le graphique de flux d'artificialisation par usage/couverture.

        Args:
            land: Instance de LandModel représentant le territoire
            params: Dictionnaire de paramètres devant contenir 'millesime_new_index'
                   et optionnellement 'departement'

        Raises:
            ValueError: Si 'millesime_new_index' n'est pas présent dans params
        """
        if "millesime_new_index" not in params:
            raise ValueError("Le paramètre 'millesime_new_index' est obligatoire")

        super().__init__(land=land, params=params)

    @property
    def data(self):
        if self.params.get("departement"):
            return self.model_by_departement.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
                departement=self.params.get("departement"),
            )
        else:
            return self.model.objects.filter(
                land_type=self.land.land_type,
                land_id=self.land.land_id,
                millesime_new_index=self.params.get("millesime_new_index"),
            )

    @property
    def series(self):
        # Si pas de données, retourner None pour déclencher noData
        if not self.data.exists():
            return None

        return [
            {
                "name": "Artificialisation",
                "data": list(self.data.values_list("flux_artif", flat=True)),
                "color": ARTIFICIALISATION_COLOR,
            },
            {
                "name": "Désartificialisation",
                "data": [item * -1 for item in self.data.values_list("flux_desartif", flat=True)],
                "color": DESARTIFICIALISATION_COLOR,
            },
            {
                "name": "Artificialisation nette",
                "data": list(self.data.values_list("flux_artif_net", flat=True)),
                "color": ARTIFICIALISATION_NETTE_COLOR,
            },
        ]

    @property
    def categories(self):
        categories = []
        for item in self.data:
            categories.append(
                f"{item.label_short} ({getattr(item, self.sol)}) <span style='color:{item.color}'></span>"
            )
        return categories

    @cached_property
    def title_end(self):
        # Si pas de données, retourner un titre par défaut
        if not self.data.exists():
            millesime_new = self.params.get("millesime_new_index")
            millesime_old = int(millesime_new) - 1
            return f" entre le millésime n°{millesime_old} et n°{millesime_new}"

        if self.params.get("departement"):
            # Afficher les années avec le département
            # Pour LandArtifFluxUsageComposition, on a year_old et year_new (singular)
            departement_code = self.params.get("departement")
            try:
                departement = Departement.objects.get(source_id=departement_code)
                departement_label = f"{departement_code} - {departement.name}"
            except Departement.DoesNotExist:
                departement_label = departement_code
            years_info = f" entre {self.data[0].year_old} et {self.data[0].year_new}"
            return f"{years_info} ({departement_label})"

        if self.land.is_interdepartemental:
            return f" entre le millésime n°{int(self.params.get('millesime_new_index')) - 1} et n°{self.params.get('millesime_new_index')}"  # noqa: E501
        else:
            return f" entre {self.data[0].years_old[0]} et {self.data[0].years_new[0]}"

    @property
    def title(self):
        return f"Artificialisation par {self.sol}{self.title_end}"

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {"text": self.title},
            "tooltip": {
                "pointFormat": "{point.y}",
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "xAxis": {
                "minPadding": 0.2,
                "maxPadding": 0.2,
                "startOnTick": True,
                "endOnTick": True,
                "categories": self.categories,
                "crop": False,
                "overflow": "allow",
            },
            "yAxis": {
                "title": {"text": "Surface (en ha)"},
                "plotLines": [
                    {
                        "value": 0,
                        "color": "black",
                        "width": 2,
                    }
                ],
            },
            "legend": {
                "align": "center",
                "verticalAlign": "top",
                "layout": "horizontal",
            },
            "plotOptions": {
                "column": {
                    "dataLabels": {"enabled": True, "format": "{point.y:,.2f}", "allowOverlap": True},
                    "groupPadding": 0.2,
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
        # Si pas de données, retourner un titre par défaut
        if not self.data.exists():
            millesime_new = self.params.get("millesime_new_index")
            millesime_old = int(millesime_new) - 1
            return f"millésime {millesime_old}-{millesime_new}"

        if self.params.get("departement"):
            # Pour LandArtifFluxUsageComposition, on a year_old et year_new
            return f"{self.data[0].year_old}-{self.data[0].year_new}"
        elif self.land.is_interdepartemental:
            millesime_new = self.params.get("millesime_new_index")
            millesime_old = int(millesime_new) - 1
            return f"millésime {millesime_old}-{millesime_new}"
        else:
            # Pour LandArtifFluxUsageCompositionIndex, on a years_old et years_new
            return f"{self.data[0].years_old[0]}-{self.data[0].years_new[0]}"

    @property
    def data_table(self):
        # Déterminer le libellé de la colonne en fonction du type (usage ou couverture)
        sol_label = self.sol.capitalize()

        headers = [
            "Code",
            sol_label,
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
                        getattr(item, self.sol),
                        item.label_short,
                        round(item.flux_artif, DEFAULT_VALUE_DECIMALS),
                        round(item.flux_desartif, DEFAULT_VALUE_DECIMALS),
                        round(item.flux_artif_net, DEFAULT_VALUE_DECIMALS),
                    ],
                }
                for item in self.data
            ],
        }


class ArtifFluxByUsageExport(ArtifFluxByUsage):
    @property
    def title_end(self):
        return f" sur le territoire de {self.land.name}"

    @property
    def param(self):
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {"text": self.title},
            "legend": {
                **super().param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
        }
