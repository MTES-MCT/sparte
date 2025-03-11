from typing import Any, Dict, List, Optional, Tuple, Union

from project.charts.base_project_chart import ProjectChart
from project.charts.constants import DEFAULT_VALUE_DECIMALS, OCSGE_CREDITS
from public_data.models import CouvertureSol, UsageSol


class CouverturePieChart(ProjectChart):
    """
    Graphique représentant tous les types de couverture du sol
    sur le territoire.
    """

    _sol = "couverture"
    name = "Sol usage and couverture pie chart"

    def get_series_item_name(self, item: Union[CouvertureSol, UsageSol]) -> str:
        """Retourne le nom formaté d'un item pour l'affichage dans le graphique."""
        return f"{item.code_prefix} {item.label}"

    def _get_items_by_parent(self, base_sol: List[Union[CouvertureSol, UsageSol]]) -> Dict[Optional[int], List]:
        """Organise les items par parent_id."""
        items_by_parent = {}
        for item in base_sol:
            if item.parent_id not in items_by_parent:
                items_by_parent[item.parent_id] = []
            items_by_parent[item.parent_id].append(item)
        return items_by_parent

    def _get_series(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Génère les séries principales et les séries de drilldown.
        """
        base_sol = self.project.get_base_sol(
            millesime=self.project.last_year_ocsge,
            sol=self._sol,
        )

        items_by_parent = self._get_items_by_parent(base_sol)

        # Obtenir les items racines pour construire la série principale
        root_items = items_by_parent.get(None, [])

        main_data = []
        for item in root_items:
            data_item = {
                "name": self.get_series_item_name(item),
                "y": float(item.surface),
                "color": item.map_color,
            }

            # Ajoute un drilldown seulement si l'élément a des enfants
            if item.id in items_by_parent:
                data_item["drilldown"] = item.code_prefix

            main_data.append(data_item)

        main_series = [{"name": "Usage du sol", "data": main_data}]

        # Génére les séries de drilldown
        drilldown_series = []
        for item in root_items:
            if item.id in items_by_parent:
                self._add_drilldown_series(item, items_by_parent, drilldown_series)

        return main_series, drilldown_series

    def _add_drilldown_series(
        self,
        parent_item: Union[CouvertureSol, UsageSol],
        items_by_parent: Dict[int, List],
        drilldown_series: List[Dict[str, Any]],
    ) -> None:
        """
        Ajoute récursivement les séries de drilldown pour un item parent donné.
        """
        children = items_by_parent.get(parent_item.id, [])
        if not children:
            return

        drilldown_data = []
        has_drilldown_children = False

        for child in children:
            # Vérifie si cet enfant a des enfants
            has_children = child.id in items_by_parent
            if has_children:
                has_drilldown_children = True

            child_data = [self.get_series_item_name(child), float(child.surface), child.map_color]
            if has_children:
                child_data.append(child.code_prefix)

            drilldown_data.append(child_data)

        drilldown_series_item = {
            "id": parent_item.code_prefix,
            "name": self.get_series_item_name(parent_item),
            "data": drilldown_data,
        }

        # Ajoute les clés uniquement si nécessaire
        if has_drilldown_children:
            drilldown_series_item["keys"] = ["name", "y", "color", "drilldown"]
        else:
            drilldown_series_item["keys"] = ["name", "y", "color"]

        drilldown_series.append(drilldown_series_item)

        # Traite récursivement les enfants qui ont des enfants
        for child in children:
            if child.id in items_by_parent:
                self._add_drilldown_series(child, items_by_parent, drilldown_series)

    @property
    def param(self) -> Dict[str, Any]:
        """Retourne les paramètres complets du graphique."""
        main_series, drilldown_series = self._get_series()

        return super().param | {
            "chart": {"type": "pie"},
            "title": {
                "text": f"Répartition de la couverture des sols en {self.project.last_year_ocsge}",
            },
            "subtitle": {
                "text": f"Cliquez sur {'une' if self._sol == 'couverture' else 'un'} {self._sol} pour voir le détail.",
            },
            "tooltip": {
                "valueSuffix": " Ha",
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
                "pointFormat": "{point.y} - {point.percent}",
                "headerFormat": "<b>{point.key}</b><br/>",
            },
            "series": main_series,
            "drilldown": {
                "series": drilldown_series,
            },
        }

    # Method stub à supprimer après refactoring
    def add_series(self) -> None:
        pass


class CouverturePieChartExport(CouverturePieChart):
    """Version exportable du graphique avec formatage spécifique."""

    def get_series_item_name(self, item: Union[CouvertureSol, UsageSol]) -> str:
        """Surcharge pour inclure la surface formatée dans le nom de l'item."""
        surface_str = f"{item.surface:.2f}".replace(".", ",")
        return f"{item.code_prefix} {item.label} - {surface_str} ha"

    @property
    def param(self) -> Dict[str, Any]:
        """Surcharge pour adapter les paramètres à l'export."""
        return super().param | {
            "credits": OCSGE_CREDITS,
            "title": {
                "text": (
                    f"Répartition de la couverture du sol de {self.project.territory_name}"
                    f" en {self.project.last_year_ocsge} (en ha)"
                )
            },
        }
