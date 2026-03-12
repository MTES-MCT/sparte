from django.utils.functional import cached_property

from project.charts.base_project_chart import DiagnosticChart
from project.charts.constants import (
    LEGEND_NAVIGATION_EXPORT,
    MAP_NAVIGATION_EXPORT,
    MAP_NORTH_INDICATOR,
    OCSGE_CREDITS,
)
from public_data.models import AdminRef, LandModel
from public_data.models.administration import LandGeoJSON


class BaseOcsgeMap(DiagnosticChart):
    """
    Classe de base pour les cartes OCS GE (artificialisation et impermeabilisation).

    Les sous-classes doivent definir :
    - stock_index_model : le modele ORM (LandArtifStockIndex ou LandImperStockIndex)
    - theme_label : ex. "artificialisation"
    - theme_label_cap : ex. "Artificialisation"
    - reverse_label : ex. "Desartificialisation"
    - stock_label : ex. "Part artificialisee"
    - surface_label : ex. "Surface artificialisee"
    - rate_label : ex. "Taux d'artificialisation"
    - flux_percent_key : ex. "flux_artif_percent"
    - export_height : hauteur du chart en mode export
    """

    stock_index_model = None
    theme_label = ""
    theme_label_cap = ""
    reverse_label = ""
    stock_label = ""
    surface_label = ""
    rate_label = ""
    flux_percent_key = ""
    export_height = 600

    def __init__(self, land, params, user=None):
        if "child_land_type" not in params:
            raise ValueError("Le parametre 'child_land_type' est obligatoire")
        if "index" not in params:
            raise ValueError("Le parametre 'index' est obligatoire")
        if "previous_index" not in params:
            raise ValueError("Le parametre 'previous_index' est obligatoire")
        super().__init__(land=land, params=params, user=user)

    @property
    def lands(self):
        return LandModel.objects.filter(
            parent_keys__contains=[f"{self.land.land_type}_{self.land.land_id}"],
            land_type=self.params.get("child_land_type"),
        )

    @property
    def stock_index_qs(self):
        return self.stock_index_model.objects.filter(
            land_id__in=self.lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("index"),
        ).order_by("land_id")

    @property
    def previous_stock_index_qs(self):
        return self.stock_index_model.objects.filter(
            land_id__in=self.lands.values_list("land_id", flat=True),
            land_type=self.params.get("child_land_type"),
            millesime_index=self.params.get("previous_index"),
        ).order_by("land_id")

    @cached_property
    def data(self):
        child_land_type = self.params.get("child_land_type")
        return [
            {
                "land_id": current.land_id,
                "land_type": child_land_type,
                "percent": current.percent,
                "surface": current.surface,
                "flux_percent": current.percent - previous.percent,
                "flux_surface": current.surface - previous.surface,
                self.flux_percent_key: (
                    (current.surface - previous.surface) / previous.surface * 100 if previous.surface else 0
                ),
                "value": current.percent,
                "years": current.years,
                "previous_years": previous.years,
                "years_str": ", ".join(map(str, current.years)),
                "previous_years_str": ", ".join(map(str, previous.years)),
                "departements": current.departements,
                "departements_str": ", ".join(current.departements),
            }
            for current, previous in zip(self.stock_index_qs.all(), self.previous_stock_index_qs.all())
        ]

    @property
    def year_or_index_before(self):
        if self.is_interdepartemental:
            return f"millesime n\u00b0{self.params.get('previous_index')}"
        else:
            return str(self.previous_stock_index_qs.first().years[0])

    @property
    def year_or_index_after(self):
        if self.is_interdepartemental:
            return f"millesime n\u00b0{self.params.get('index')}"
        else:
            return str(self.stock_index_qs.first().years[-1])

    @property
    def data_table(self):
        headers = [
            AdminRef.get_label(self.params.get("child_land_type")),
            f"{self.stock_label} (%) - {self.year_or_index_after}",
            f"{self.surface_label} (ha) - {self.year_or_index_after}",
            f"{self.theme_label_cap} (ha) - {self.year_or_index_before} -> {self.year_or_index_after}",
            f"{self.theme_label_cap} (%) - {self.year_or_index_before} -> {self.year_or_index_after}",
        ]

        return {
            "headers": headers,
            "boldFirstColumn": True,
            "rows": [
                {
                    "name": "",
                    "data": [
                        self.lands.get(land_id=d["land_id"]).name,
                        round(d["percent"], 2),
                        round(d["surface"], 2),
                        round(d["flux_surface"], 2),
                        round(d["flux_percent"], 2),
                    ],
                }
                for d in self.data
            ],
        }

    @property
    def is_interdepartemental(self):
        return self.lands.values("departements").distinct().count() > 1

    @property
    def title_end(self):
        if self.is_interdepartemental:
            return f"entre le {self.year_or_index_before} et le {self.year_or_index_after}"
        return f"entre {self.year_or_index_before} et {self.year_or_index_after}"

    @property
    def formatted_child_land_type(self):
        child_land_type = self.params.get("child_land_type")
        if child_land_type in [AdminRef.SCOT, AdminRef.EPCI]:
            return AdminRef.get_label(self.params.get("child_land_type"))
        return AdminRef.get_label(self.params.get("child_land_type")).lower()

    @property
    def stock_tooltip(self):
        return {
            "pointFormat": (
                f"<b>{{point.name}}</b>:<br/>"
                f"{self.rate_label} : {{point.percent:.2f}} % ({{point.surface:.1f}} ha)"
            ),
        }

    @property
    def flux_tooltip_pos(self):
        return {
            "pointFormat": (
                f"<b>{{point.name}}</b>:<br/>"
                f"{self.theme_label_cap} : +{{point.flux_percent:.2f}} % (+{{point.flux_surface:.1f}} ha)"
            ),
        }

    @property
    def flux_tooltip_neg(self):
        return {
            "pointFormat": (
                f"<b>{{point.name}}</b>:<br/>"
                f"{self.reverse_label} : {{point.flux_percent:.2f}} % ({{point.flux_surface:.1f}} ha)"
            ),
        }

    @property
    def param(self):
        geojson = LandGeoJSON.for_parent(self.land.land_id, self.land.land_type, self.params.get("child_land_type"))

        child_land_type = self.params.get("child_land_type")
        is_drillable = child_land_type != AdminRef.COMMUNE

        percents = [d["percent"] for d in self.data]
        bubble_data_pos = [
            {
                "land_id": d["land_id"],
                "land_type": d["land_type"],
                "z": d["flux_surface"],
                "flux_surface": d["flux_surface"],
                "flux_percent": d[self.flux_percent_key],
            }
            for d in self.data
            if d["flux_surface"] > 0
        ]
        bubble_data_neg = [
            {
                "land_id": d["land_id"],
                "land_type": d["land_type"],
                "z": abs(d["flux_surface"]),
                "flux_surface": d["flux_surface"],
                "flux_percent": d[self.flux_percent_key],
            }
            for d in self.data
            if d["flux_surface"] <= 0
        ]

        return super().param | {
            "chart": {
                "map": geojson,
                "backgroundColor": "transparent",
            },
            "title": {
                "text": (
                    f"{self.theme_label_cap} des {self.formatted_child_land_type}s "
                    f"de {self.land.name} {self.title_end}"
                )
            },
            "xAxis": {"visible": False},
            "yAxis": {"visible": False},
            "mapNavigation": {"enabled": self.lands.count() > 20},
            "legend": {
                "title": {"text": f"{self.rate_label} (%)"},
                "backgroundColor": "transparent",
                "bubbleLegend": {
                    "enabled": True,
                    "borderWidth": 1,
                    "labels": {"format": "{value:.0f} ha"},
                    "color": "transparent",
                    "borderColor": "#000",
                    "connectorDistance": 40,
                    "connectorColor": "#000",
                },
            },
            "colorAxis": {
                "min": min(percents),
                "max": max(percents),
                "minColor": "#FFFFFF",
                "maxColor": "#6a6af4",
                "showInLegend": True,
            },
            "series": [
                {
                    "name": self.land.name,
                    "data": self.data,
                    "joinBy": ["land_id"],
                    "opacity": 1,
                    **({"cursor": "pointer"} if is_drillable else {}),
                    "showInLegend": False,
                    "dataLabels": {"enabled": False},
                    "tooltip": self.stock_tooltip,
                },
                {
                    "type": "mapbubble",
                    "name": f"{self.theme_label_cap} (ha)",
                    "data": bubble_data_pos,
                    "joinBy": ["land_id"],
                    "color": "#FC9292",
                    "minSize": 5,
                    "maxSize": "8%",
                    "opacity": 0.7,
                    **({"cursor": "pointer"} if is_drillable else {}),
                    "showInLegend": True,
                    "colorAxis": False,
                    "tooltip": self.flux_tooltip_pos,
                },
                {
                    "type": "mapbubble",
                    "name": f"{self.reverse_label} (ha)",
                    "data": bubble_data_neg,
                    "joinBy": ["land_id"],
                    "color": "#7ec974",
                    "minSize": 5,
                    "maxSize": "8%",
                    "opacity": 0.7,
                    **({"cursor": "pointer"} if is_drillable else {}),
                    "showInLegend": True,
                    "colorAxis": False,
                    "tooltip": self.flux_tooltip_neg,
                },
            ],
        }


class BaseOcsgeMapExport(BaseOcsgeMap):
    @property
    def param(self):
        base_param = super().param

        return base_param | {
            "chart": {
                **base_param["chart"],
                "height": self.export_height,
            },
            "credits": OCSGE_CREDITS,
            "mapNavigation": {
                **MAP_NAVIGATION_EXPORT,
                "enabled": True,
                "enableButtons": False,
            },
            "legend": {
                **base_param["legend"],
                "navigation": LEGEND_NAVIGATION_EXPORT,
            },
            "title": {
                "text": f"{base_param['title']['text']} sur le territoire {self.land.name}",
            },
            "subtitle": MAP_NORTH_INDICATOR,
        }
