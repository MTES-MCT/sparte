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
            "title": {"text": ""},
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

    @property
    def data_table(self):  # noqa: C901
        # Déterminer le type de child (ex: COMM pour EPCI, EPCI pour SCOT, etc.)
        child_types = getattr(self.land, "child_land_types", [])
        child_type = child_types[0] if child_types else None

        if child_type:
            # Récupérer les children qui appartiennent au territoire
            children = LandModel.objects.filter(
                land_type=child_type, parent_keys__contains=[f"{self.land.land_type}_{self.land.land_id}"]
            ).order_by("name")

            children_ids = list(children.values_list("land_id", flat=True))
            children_names = {child.land_id: child.name for child in children}

            # Identifier les children interdépartementaux et leurs sous-children
            interdep_children = {}
            all_leaf_ids = set(children_ids)  # Commencer avec tous les children
            sub_children_by_type = {}  # Garder trace des sub_children par type

            for child in children:
                if child.is_interdepartemental:
                    # Ce child est interdépartemental, récupérer ses propres children
                    # MAIS seulement ceux qui appartiennent aussi au territoire parent (self.land)
                    sub_child_types = child.child_land_types
                    if sub_child_types:
                        sub_child_type = sub_child_types[0]
                        # Filtrer pour ne garder que les sub_children qui appartiennent au territoire parent
                        parent_child_key = f"{child.land_type}_{child.land_id}"
                        parent_land_key = f"{self.land.land_type}_{self.land.land_id}"
                        sub_children = (
                            LandModel.objects.filter(
                                land_type=sub_child_type, parent_keys__contains=[parent_child_key]
                            )
                            .filter(parent_keys__contains=[parent_land_key])
                            .order_by("name")
                        )

                        if sub_children.exists():
                            interdep_children[child.land_id] = list(sub_children)
                            all_leaf_ids.remove(child.land_id)  # Retirer le parent interdép

                            # Garder trace des sub_children par type
                            if sub_child_type not in sub_children_by_type:
                                sub_children_by_type[sub_child_type] = []
                            sub_children_ids = sub_children.values_list("land_id", flat=True)
                            sub_children_by_type[sub_child_type].extend(sub_children_ids)

            # Récupérer les données de consommation pour tous les types
            children_conso_list = []

            # Children normaux (du type principal)
            if all_leaf_ids:
                children_conso_list.extend(
                    LandConso.objects.filter(
                        land_type=child_type,
                        land_id__in=list(all_leaf_ids),
                        year__gte=int(self.params["start_date"]),
                        year__lte=int(self.params["end_date"]),
                    )
                )

            # Sub-children des interdépartementaux (peuvent être d'un autre type)
            for sub_type, sub_ids in sub_children_by_type.items():
                sub_conso = LandConso.objects.filter(
                    land_type=sub_type,
                    land_id__in=list(sub_ids),
                    year__gte=int(self.params["start_date"]),
                    year__lte=int(self.params["end_date"]),
                )
                children_conso_list.extend(sub_conso)

            children_conso = children_conso_list

            # Créer une structure {name: {year: total}} pour add_total_line_column
            conso_dict = {}
            conso_by_id = {}  # Pour stocker par land_id

            for conso in children_conso:
                if conso.land_id not in conso_by_id:
                    conso_by_id[conso.land_id] = {}
                conso_by_id[conso.land_id][str(conso.year)] = round(conso.total / 10000, DEFAULT_VALUE_DECIMALS)

            # Construire conso_dict avec les noms
            for land_id, year_data in conso_by_id.items():
                # Chercher le nom dans children_names ou dans les sub_children
                name = children_names.get(land_id)
                if not name:
                    # Chercher dans les sub_children
                    for parent_id, sub_children_list in interdep_children.items():
                        for sub_child in sub_children_list:
                            if sub_child.land_id == land_id:
                                name = sub_child.name
                                break
                        if name:
                            break

                if name:
                    conso_dict[name] = year_data

            # Calculer les totaux pour les parents interdépartementaux
            # en sommant leurs sub_children
            for parent_id, sub_children_list in interdep_children.items():
                parent_name = children_names[parent_id]
                parent_data = {}

                for sub_child in sub_children_list:
                    sub_name = sub_child.name
                    if sub_name in conso_dict:
                        for year, value in conso_dict[sub_name].items():
                            parent_data[year] = parent_data.get(year, 0) + value

                if parent_data:
                    conso_dict[parent_name] = parent_data

            # Pour le calcul du total global, on ne doit pas inclure les sub_children
            # car ils sont déjà comptés dans leur parent interdépartemental
            # On crée un dictionnaire sans les sub_children pour le calcul du total
            conso_dict_for_total = {}
            sub_children_names = set()
            for parent_id, sub_children_list in interdep_children.items():
                for sub_child in sub_children_list:
                    sub_children_names.add(sub_child.name)

            for name, data in conso_dict.items():
                if name not in sub_children_names:
                    conso_dict_for_total[name] = data

            # Ajouter les totaux (ligne et colonne) - sans les sub_children pour le total ligne
            conso_with_totals_for_display = add_total_line_column(conso_dict_for_total, column=True, line=True)

            # Mais on garde aussi les totaux avec tous pour l'affichage des colonnes individuelles
            conso_with_totals = add_total_line_column(conso_dict, column=True, line=False)

            # Générer les années pour les headers
            years = list(range(int(self.params["start_date"]), int(self.params["end_date"]) + 1))
            headers = [AdminRef.get_label(child_type)] + [str(year) for year in years] + ["Total"]

            # Convertir en format data_table avec gestion des interdépartementaux
            rows = []

            # Construire un mapping des sub_children vers leur parent
            sub_child_to_parent = {}
            for parent_id, sub_children_list in interdep_children.items():
                for sub_child in sub_children_list:
                    sub_child_to_parent[sub_child.name] = children_names[parent_id]

            # Parcourir les children dans l'ordre
            for child in children:
                child_name = child.name

                if child.is_interdepartemental and child.land_id in interdep_children:
                    # Ajouter une ligne pour le child interdépartemental (en gras)
                    row_data = (
                        [f"{child_name} (interdépartemental)"]
                        + [
                            round(conso_with_totals.get(child_name, {}).get(str(year), 0), DEFAULT_VALUE_DECIMALS)
                            for year in years
                        ]
                        + [round(conso_with_totals.get(child_name, {}).get("total", 0), DEFAULT_VALUE_DECIMALS)]
                    )
                    rows.append({"name": "", "data": row_data})

                    # Ajouter les sous-children avec indentation
                    for sub_child in interdep_children[child.land_id]:
                        sub_name = sub_child.name
                        if sub_name in conso_with_totals:
                            row_data = (
                                [f"  └─ {sub_name}"]
                                + [conso_with_totals[sub_name].get(str(year), 0) for year in years]
                                + [conso_with_totals[sub_name].get("total", 0)]
                            )
                            rows.append({"name": "", "data": row_data})
                else:
                    # Child normal (non interdépartemental)
                    if child_name in conso_with_totals:
                        row_data = (
                            [child_name]
                            + [conso_with_totals[child_name].get(str(year), 0) for year in years]
                            + [conso_with_totals[child_name].get("total", 0)]
                        )
                        rows.append({"name": "", "data": row_data})

            # Ajouter la ligne Total à la fin (en utilisant le total qui exclut les sub_children)
            if "Total" in conso_with_totals_for_display:
                total_row_data = (
                    ["Total"]
                    + [conso_with_totals_for_display["Total"].get(str(year), 0) for year in years]
                    + [conso_with_totals_for_display["Total"].get("total", 0)]
                )
                rows.append({"name": "", "data": total_row_data})

        else:
            # Pas de children, on affiche les données du territoire lui-même par année
            # Créer un dictionnaire pour add_total_line_column
            data_dict = {
                self.land.name: {str(item.year): round(item.total, DEFAULT_VALUE_DECIMALS) for item in self.data}
            }
            data_with_totals = add_total_line_column(data_dict, column=True, line=False)

            years = [str(item.year) for item in self.data]
            headers = ["Année"] + years + ["Total"]

            # Une seule ligne avec les valeurs et le total
            row_data = (
                [self.land.name]
                + [data_with_totals[self.land.name].get(year, 0) for year in years]
                + [data_with_totals[self.land.name].get("total", 0)]
            )
            rows = [{"name": "", "data": row_data}]

        return {
            "headers": headers,
            "rows": rows,
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
