from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    CEREMA_CREDITS,
    DEFAULT_HEADER_FORMAT,
    DEFAULT_POINT_FORMAT,
    DEFAULT_VALUE_DECIMALS,
)
from project.utils import add_total_line_column
from public_data.domain.containers import PublicDataContainer
from public_data.models import AdminRef, LandModel
from public_data.models.consommation import LandConso


class AnnualTotalConsoChart(DiagnosticChart):
    required_params = ["start_date", "end_date"]
    name = "conso communes"

    @property
    def data(self):
        """Get consumption data for the land."""
        if not hasattr(self, "_cached_data"):
            consommation_progression = PublicDataContainer.consommation_progression_service().get_by_land(
                land=self.land,
                start_date=int(self.params["start_date"]),
                end_date=int(self.params["end_date"]),
            )
            self._cached_data = consommation_progression.consommation
        return self._cached_data

    @property
    def series(self):
        """Generate series data from consumption data."""
        data = [
            {
                "name": str(item.year),
                "y": item.total,  # Already in hectares from ConsommationProgressionService
            }
            for item in self.data
        ]
        return [
            {
                "name": self.land.name,
                "data": data,
            }
        ]

    @property
    def param(self):
        return super().param | {
            "chart": {"type": "column"},
            "title": {
                "text": f"Consommation annuelle d'espaces NAF - {self.land.name} ({self.params['start_date']} - {self.params['end_date']})"  # noqa: E501
            },
            "yAxis": {"title": {"text": "Consommation d'espaces NAF (ha)"}},
            "xAxis": {"type": "category"},
            "tooltip": {
                "headerFormat": DEFAULT_HEADER_FORMAT,
                "pointFormat": DEFAULT_POINT_FORMAT,
                "valueDecimals": DEFAULT_VALUE_DECIMALS,
            },
            "legend": {"enabled": False},
            "series": self.series,
        }

    def get_series(self):
        """Legacy method for backward compatibility."""
        return {self.land.name: {str(item.year): item.total for item in self.data}}

    def _get_child_type(self):
        """Détermine le type de child à afficher."""
        child_types = getattr(self.land, "child_land_types", [])
        return self.params.get("child_type") or (child_types[0] if child_types else None)

    def _get_children(self, child_type):
        """Récupère les children du territoire."""
        return LandModel.objects.filter(
            land_type=child_type,
            parent_keys__contains=[f"{self.land.land_type}_{self.land.land_id}"],
        ).order_by("name")

    def _is_interterritorial(self, child):
        """
        Vérifie si un child est inter (interdépartemental ou interrégional).
        Pour les REGION, vérifie si le child a des départements dans d'autres régions.
        """
        if not child.is_interdepartemental:
            return False

        if self.land.land_type != "REGION":
            return True

        # Pour les REGION, vérifier si tous les départements sont dans cette région
        region_key = f"REGION_{self.land.land_id}"
        child_depts = LandModel.objects.filter(
            land_type="DEPART",
            land_id__in=child.departements,
        )
        return any(region_key not in dept.parent_keys for dept in child_depts)

    def _get_sub_children(self, child):
        """Récupère les sub-children d'un child inter qui appartiennent au territoire parent."""
        sub_child_types = child.child_land_types
        if not sub_child_types:
            return []

        sub_child_type = sub_child_types[0]
        parent_child_key = f"{child.land_type}_{child.land_id}"
        parent_land_key = f"{self.land.land_type}_{self.land.land_id}"

        return list(
            LandModel.objects.filter(land_type=sub_child_type, parent_keys__contains=[parent_child_key])
            .filter(parent_keys__contains=[parent_land_key])
            .order_by("name")
        )

    def _identify_inter_children(self, children, children_ids):
        """
        Identifie les children inter et leurs sub-children.
        Retourne (interdep_children, all_leaf_ids, sub_children_by_type).
        """
        interdep_children = {}
        all_leaf_ids = set(children_ids)
        sub_children_by_type = {}

        for child in children:
            if not self._is_interterritorial(child):
                continue

            sub_children = self._get_sub_children(child)
            if not sub_children:
                continue

            interdep_children[child.land_id] = sub_children
            all_leaf_ids.discard(child.land_id)

            # Garder trace des sub_children par type
            sub_child_type = child.child_land_types[0]
            if sub_child_type not in sub_children_by_type:
                sub_children_by_type[sub_child_type] = []
            sub_children_by_type[sub_child_type].extend(sc.land_id for sc in sub_children)

        return interdep_children, all_leaf_ids, sub_children_by_type

    def _fetch_consumption_data(self, child_type, all_leaf_ids, sub_children_by_type):
        """Récupère les données de consommation pour tous les types."""
        start_date = int(self.params["start_date"])
        end_date = int(self.params["end_date"])
        children_conso_list = []

        # Children normaux (du type principal)
        if all_leaf_ids:
            children_conso_list.extend(
                LandConso.objects.filter(
                    land_type=child_type,
                    land_id__in=list(all_leaf_ids),
                    year__gte=start_date,
                    year__lte=end_date,
                )
            )

        # Sub-children des interdépartementaux
        for sub_type, sub_ids in sub_children_by_type.items():
            children_conso_list.extend(
                LandConso.objects.filter(
                    land_type=sub_type,
                    land_id__in=list(sub_ids),
                    year__gte=start_date,
                    year__lte=end_date,
                )
            )

        return children_conso_list

    def _build_conso_by_id(self, children_conso):
        """Construit un dictionnaire {land_id: {year: total}}."""
        conso_by_id = {}
        for conso in children_conso:
            if conso.land_id not in conso_by_id:
                conso_by_id[conso.land_id] = {}
            conso_by_id[conso.land_id][str(conso.year)] = round(conso.total / 10000, DEFAULT_VALUE_DECIMALS)
        return conso_by_id

    def _find_name_for_land_id(self, land_id, children_names, interdep_children):
        """Trouve le nom d'un territoire par son land_id."""
        name = children_names.get(land_id)
        if name:
            return name

        for sub_children_list in interdep_children.values():
            for sub_child in sub_children_list:
                if sub_child.land_id == land_id:
                    return sub_child.name
        return None

    def _build_conso_dict(self, conso_by_id, children_names, interdep_children):
        """Construit le dictionnaire {name: {year: total}}."""
        conso_dict = {}
        for land_id, year_data in conso_by_id.items():
            name = self._find_name_for_land_id(land_id, children_names, interdep_children)
            if name:
                conso_dict[name] = year_data

        # Calculer les totaux pour les parents interdépartementaux
        for parent_id, sub_children_list in interdep_children.items():
            parent_name = children_names[parent_id]
            parent_data = {}
            for sub_child in sub_children_list:
                if sub_child.name in conso_dict:
                    for year, value in conso_dict[sub_child.name].items():
                        parent_data[year] = parent_data.get(year, 0) + value
            if parent_data:
                conso_dict[parent_name] = parent_data

        return conso_dict

    def _get_sub_children_names(self, interdep_children):
        """Retourne l'ensemble des noms des sub-children."""
        names = set()
        for sub_children_list in interdep_children.values():
            for sub_child in sub_children_list:
                names.add(sub_child.name)
        return names

    def _build_row(self, name, data, years, indent=False):
        """Construit une ligne du tableau."""
        display_name = f"  └─ {name}" if indent else name
        row_data = [display_name] + [data.get(str(year), 0) for year in years] + [data.get("total", 0)]
        return {"name": "", "data": row_data}

    def _build_rows(self, children, interdep_children, conso_with_totals, conso_for_total, years):
        """Construit les lignes du tableau."""
        rows = []
        inter_label = "interrégional" if self.land.land_type == "REGION" else "interdépartemental"

        for child in children:
            child_name = child.name

            if child.is_interdepartemental and child.land_id in interdep_children:
                # Ligne pour le child inter
                display_name = f"{child_name} ({inter_label})"
                data = conso_with_totals.get(child_name, {})
                row_data = (
                    [display_name]
                    + [round(data.get(str(year), 0), DEFAULT_VALUE_DECIMALS) for year in years]
                    + [round(data.get("total", 0), DEFAULT_VALUE_DECIMALS)]
                )
                rows.append({"name": "", "data": row_data})

                # Sous-children avec indentation
                for sub_child in interdep_children[child.land_id]:
                    if sub_child.name in conso_with_totals:
                        rows.append(
                            self._build_row(sub_child.name, conso_with_totals[sub_child.name], years, indent=True)
                        )
            elif child_name in conso_with_totals:
                # Child normal
                rows.append(self._build_row(child_name, conso_with_totals[child_name], years))

        # Ligne Total
        if "Total" in conso_for_total:
            rows.append(self._build_row("Total", conso_for_total["Total"], years))

        return rows

    @property
    def data_table(self):
        child_type = self._get_child_type()

        if child_type:
            return self._build_data_table_with_children(child_type)
        return self._build_data_table_without_children()

    def _build_data_table_with_children(self, child_type):
        """Construit le data_table avec les children du territoire."""
        children = self._get_children(child_type=child_type)
        children_ids = list(children.values_list("land_id", flat=True))
        children_names = {child.land_id: child.name for child in children}

        # Identifier les children inter et leurs sub-children
        interdep_children, all_leaf_ids, sub_children_by_type = self._identify_inter_children(
            children=children, children_ids=children_ids
        )

        # Récupérer les données de consommation
        children_conso = self._fetch_consumption_data(
            child_type=child_type, all_leaf_ids=all_leaf_ids, sub_children_by_type=sub_children_by_type
        )

        # Construire les dictionnaires de consommation
        conso_by_id = self._build_conso_by_id(children_conso=children_conso)
        conso_dict = self._build_conso_dict(
            conso_by_id=conso_by_id, children_names=children_names, interdep_children=interdep_children
        )

        # Préparer les données pour le calcul du total (exclure les sub_children)
        sub_children_names = self._get_sub_children_names(interdep_children=interdep_children)
        conso_dict_for_total = {name: data for name, data in conso_dict.items() if name not in sub_children_names}

        # Ajouter les totaux
        conso_with_totals = add_total_line_column(series=conso_dict, column=True, line=False)
        conso_for_total = add_total_line_column(series=conso_dict_for_total, column=True, line=True)

        # Générer les headers et les rows
        years = list(range(int(self.params["start_date"]), int(self.params["end_date"]) + 1))
        headers = [AdminRef.get_label(child_type)] + [str(year) for year in years] + ["Total"]
        rows = self._build_rows(
            children=children,
            interdep_children=interdep_children,
            conso_with_totals=conso_with_totals,
            conso_for_total=conso_for_total,
            years=years,
        )

        return {
            "headers": headers,
            "rows": rows,
            "boldFirstColumn": True,
            "boldLastColumn": True,
            "boldLastRow": True,
        }

    def _build_data_table_without_children(self):
        """Construit le data_table sans children (données du territoire lui-même)."""
        data_dict = {self.land.name: {str(item.year): round(item.total, DEFAULT_VALUE_DECIMALS) for item in self.data}}
        data_with_totals = add_total_line_column(series=data_dict, column=True, line=False)

        years = [str(item.year) for item in self.data]
        headers = ["Année"] + years + ["Total"]

        row_data = (
            [self.land.name]
            + [data_with_totals[self.land.name].get(year, 0) for year in years]
            + [data_with_totals[self.land.name].get("total", 0)]
        )

        return {
            "headers": headers,
            "rows": [{"name": "", "data": row_data}],
            "boldFirstColumn": True,
            "boldLastColumn": True,
            "boldLastRow": True,
        }


class AnnualTotalConsoChartExport(AnnualTotalConsoChart):
    @property
    def param(self):
        return super().param | {
            "title": {
                "text": (
                    f"Consommation d'espaces NAF à {self.land.name} "
                    f"entre {self.params['start_date']} et {self.params['end_date']} (en ha)"
                )
            },
            "credits": CEREMA_CREDITS,
            "plotOptions": {
                "column": {
                    "dataLabels": {
                        "enabled": True,
                        "format": "{point.y:,.1f}",
                        "allowOverlap": True,
                    },
                }
            },
        }
