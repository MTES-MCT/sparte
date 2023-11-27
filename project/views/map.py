from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.db.models import F, FloatField, Max, OuterRef, Subquery, Sum
from django.db.models.functions import Cast
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import DetailView
from jenkspy import jenks_breaks

from project.models import Project
from project.serializers import CityArtifMapSerializer, CitySpaceConsoMapSerializer
from public_data.models import Cerema, CouvertureSol, UsageSol
from utils.colors import get_dark_blue_gradient, get_yellow2red_gradient

from .mixins import GroupMixin


class BaseMap(GroupMixin, DetailView):
    """This is a base class for a map. Build for MapLibre

    Main methods:
    =============
    * get_sources_list: define the data sources to use for the layers
    * get_layers_list: define the filters to be display in the map
    * get_filters_list: define the filters to be display in the filters zone
    """

    queryset = Project.objects.all()
    template_name = "carto/map_libre.html"
    title = "To be set"
    default_zoom: int

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"title": self.title},
        ]
        return breadcrumbs

    def get_sources_list(self, *sources):
        sources = [
            {
                "key": "fond-de-carte-source",
                "params": {
                    "type": "raster",
                    "tiles": [settings.ORTHOPHOTO_URL],
                    "tileSize": 256,
                },
            },
            {
                "key": "emprise-du-territoire-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("project:emprise-list"),
                },
                "query_strings": [
                    {
                        "type": "string",
                        "key": "id",
                        "value": self.object.pk,
                    },
                ],
            },
            {
                "key": "limites-administratives-source",
                "params": {
                    "type": "vector",
                    "url": "https://wxs.ign.fr/administratif/geoportail/tms/1.0.0/ADMIN_EXPRESS/metadata.json",
                },
            },
        ] + list(sources)
        return sources

    def get_layers_list(self, *layers):
        layers = [
            {
                "id": "fond-de-carte-layer",
                "z-index": 0,
                "type": "raster",
                "source": "fond-de-carte-source",
            },
            {
                "id": "limites-administratives-region-layer",
                "z-index": 1,
                "type": "line",
                "source": "limites-administratives-source",
                "source-layer": "region",
                "paint": {
                    "line-color": "#b5bee2",
                    "line-width": 1.5,
                },
            },
            {
                "id": "limites-administratives-departement-layer",
                "z-index": 2,
                "type": "line",
                "source": "limites-administratives-source",
                "source-layer": "departement",
                "paint": {
                    "line-color": "#b5bee2",
                    "line-width": 1.5,
                },
            },
            {
                "id": "limites-administratives-epci-layer",
                "z-index": 3,
                "type": "line",
                "source": "limites-administratives-source",
                "source-layer": "epci",
                "paint": {
                    "line-color": "#b5bee2",
                    "line-width": 1.5,
                },
            },
            {
                "id": "limites-administratives-commune-layer",
                "z-index": 4,
                "type": "line",
                "source": "limites-administratives-source",
                "source-layer": "commune",
                "paint": {
                    "line-color": "#b5bee2",
                    "line-width": 1.5,
                },
            },
            {
                "id": "emprise-du-territoire-layer",
                "z-index": 5,
                "type": "line",
                "source": "emprise-du-territoire-source",
                "paint": {
                    "line-color": "#ffff00",
                    "line-width": 1.5,
                },
            },
            {
                "id": "limites-administratives-region-labels",
                "z-index": 10,
                "type": "symbol",
                "source": "limites-administratives-source",
                "source-layer": "region",
                "layout": {
                    "text-size": 16,
                    "text-field": ["get", "nom"],
                    "text-anchor": "top",
                    "text-font": ["Marianne Regular"],
                },
                "paint": {
                    "text-color": "#000000",
                    "text-halo-color": "#E5EEFD",
                    "text-halo-width": 1.5,
                },
            },
            {
                "id": "limites-administratives-departement-labels",
                "z-index": 11,
                "type": "symbol",
                "source": "limites-administratives-source",
                "source-layer": "departement",
                "layout": {
                    "text-size": 15,
                    "text-field": ["get", "nom"],
                    "text-anchor": "top",
                    "text-font": ["Marianne Regular"],
                },
                "paint": {
                    "text-color": "#000000",
                    "text-halo-color": "#E5EEFD",
                    "text-halo-width": 2,
                },
            },
            {
                "id": "limites-administratives-epci-labels",
                "z-index": 12,
                "type": "symbol",
                "source": "limites-administratives-source",
                "source-layer": "epci",
                "layout": {
                    "text-size": 13,
                    "text-field": ["get", "nom"],
                    "text-anchor": "top",
                    "text-font": ["Marianne Regular"],
                },
                "paint": {
                    "text-color": "#000000",
                    "text-halo-color": "#E5EEFD",
                    "text-halo-width": 2,
                },
            },
            {
                "id": "limites-administratives-commune-labels",
                "z-index": 13,
                "type": "symbol",
                "source": "limites-administratives-source",
                "source-layer": "commune",
                "layout": {
                    "text-size": 12,
                    "text-field": ["get", "nom"],
                    "text-anchor": "top",
                    "text-font": ["Marianne Regular"],
                },
                "paint": {
                    "text-color": "#000000",
                    "text-halo-color": "#E5EEFD",
                    "text-halo-width": 2,
                },
            },
        ] + list(layers)
        return layers

    def get_filters_list(self, *filters):
        filters = [
            {
                "name": "Fond de carte",
                "z-index": 0,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": ["fond-de-carte-layer"],
                            },
                        ],
                    },
                    {
                        "name": "Opacité du calque",
                        "type": "opacity",
                        "value": 100,
                        "triggers": [
                            {
                                "method": "changePaintProperty",
                                "property": "raster-opacity",
                                "items": ["fond-de-carte-layer"],
                            },
                        ],
                    },
                ],
                "source": "fond-de-carte-source",
            },
            {
                "name": "Emprise du territoire",
                "z-index": 1,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": ["emprise-du-territoire-layer"],
                            },
                        ],
                    },
                    {
                        "name": "Opacité du calque",
                        "type": "opacity",
                        "value": 100,
                        "triggers": [
                            {
                                "method": "changePaintProperty",
                                "property": "line-opacity",
                                "items": ["emprise-du-territoire-layer"],
                            },
                        ],
                    },
                ],
                "source": "emprise-du-territoire-source",
            },
            {
                "name": "Limites administratives",
                "z-index": 3,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": [
                                    "limites-administratives-region-layer",
                                    "limites-administratives-departement-layer",
                                    "limites-administratives-epci-layer",
                                    "limites-administratives-commune-layer",
                                    "limites-administratives-region-labels",
                                    "limites-administratives-departement-labels",
                                    "limites-administratives-epci-labels",
                                    "limites-administratives-commune-labels",
                                ],
                            },
                        ],
                    },
                    {
                        "name": "Opacité du calque",
                        "type": "opacity",
                        "value": 100,
                        "triggers": [
                            {
                                "method": "changePaintProperty",
                                "property": "line-opacity",
                                "items": [
                                    "limites-administratives-region-layer",
                                    "limites-administratives-departement-layer",
                                    "limites-administratives-epci-layer",
                                    "limites-administratives-commune-layer",
                                ],
                            },
                            {
                                "method": "changePaintProperty",
                                "property": "text-opacity",
                                "items": [
                                    "limites-administratives-region-labels",
                                    "limites-administratives-departement-labels",
                                    "limites-administratives-epci-labels",
                                    "limites-administratives-commune-labels",
                                ],
                            },
                        ],
                    },
                ],
                "source": "limites-administratives-source",
            },
        ] + list(filters)
        return filters

    def get_context_data(self, **kwargs):
        center = self.object.get_centroid()
        layers = self.get_layers_list()
        layers.sort(key=lambda x: x["z-index"])
        filters = self.get_filters_list()
        filters.sort(key=lambda x: x["z-index"])
        kwargs.update(
            {
                "map_name": self.title,
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": self.default_zoom,
                "data": {
                    "sources": self.get_sources_list(),
                    "layers": layers,
                    "filters": filters,
                },
            }
        )
        return super().get_context_data(**kwargs)


class MapTestView(BaseMap):
    title = "Carte de test"
    scale_size = 5
    default_zoom = 10

    def get_sources_list(self, *sources):
        sources = [
            {
                "key": "consommation-des-communes-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("project:theme-city-conso", args=[self.object.id]),
                },
                "query_strings": [
                    {
                        "type": "string",
                        "key": "data",
                        "value": 1,
                    },
                    {
                        "type": "function",
                        "key": "in_bbox",
                        "value": "getBbox",
                    },
                ],
                "min_zoom": 8,
            },
        ]
        return super().get_sources_list(*sources)

    def get_layers_list(self, *layers):
        layers = [
            {
                "id": "consommation-des-communes-fill-layer",
                "z-index": 4,
                "type": "fill",
                "source": "consommation-des-communes-source",
                "minzoom": 8,
                "maxzoom": 19,
                "paint": {
                    "fill-color": self.get_gradient_expression(),
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], False],
                        0.8,
                        0.6,
                    ],
                },
                "legend": {
                    "title": "Consommation des communes",
                    "subtitle": (
                        f"Surface consommée de {self.object.analyse_start_date} à {self.object.analyse_end_date}"
                    ),
                    "type": "scale",
                    "data": self.get_gradient_scale(),
                    "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                },
                "events": [
                    {
                        "type": "mousemove",
                        "triggers": [
                            {
                                "method": "hoverEffectIn",
                            },
                            {
                                "method": "showInfoBox",
                                "options": {
                                    "title": "Consommation des communes",
                                    "properties": [
                                        {"name": "Commune", "key": "name"},
                                        {"name": "Code INSEE", "key": "insee"},
                                        {
                                            "name": "Surface consommée",
                                            "key": "artif_area",
                                            "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        "type": "mouseleave",
                        "triggers": [
                            {
                                "method": "hoverEffectOut",
                            },
                            {
                                "method": "hideInfoBox",
                            },
                        ],
                    },
                ],
            },
        ]
        return super().get_layers_list(*layers)

    def get_filters_list(self, *filters):
        filters = [
            {
                "name": "Consommation des communes",
                "z-index": 3,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": ["consommation-des-communes-fill-layer"],
                            },
                            {
                                "method": "toggleLegend",
                                "property": "visible",
                                "items": ["legend-box-consommation-des-communes-source"],
                            },
                        ],
                    },
                ],
                "source": "fond-de-carte-source",
            },
        ]
        return super().get_filters_list(*filters)

    def get_gradient_scale(self):
        fields = Cerema.get_art_field(self.object.analyse_start_date, self.object.analyse_end_date)
        qs = (
            self.object.get_cerema_cities()
            .annotate(conso=sum([F(f) for f in fields]) / 10000)
            .values("city_name")
            .annotate(conso=Sum(F("conso")))
            .order_by("conso")
        )
        if qs.count() <= self.scale_size:
            boundaries = sorted([i["conso"] for i in qs])
        else:
            boundaries = jenks_breaks([i["conso"] for i in qs], n_classes=self.scale_size)[1:]
        data = [{"value": v, "color": c.hex_l} for v, c in zip(boundaries, get_dark_blue_gradient(len(boundaries)))]
        return data

    def get_gradient_expression(self):
        data = [
            "interpolate",
            ["linear"],
            ["get", "artif_area"],
        ]
        for scale in self.get_gradient_scale():
            data.append(scale["value"])
            data.append(scale["color"])
        return data


class UrbanZonesMapView(BaseMap):
    title = "Explorateur des zonages d'urbanisme"
    default_zoom = 12

    def get_sources_list(self, *sources):
        available_millesimes = self.object.get_available_millesimes(commit=True)
        sources = [
            {
                "key": "ocs-ge-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("public_data:ocsge-optimized"),
                    "generateId": True,  # This ensures that all features have unique IDs
                },
                "query_strings": [
                    {
                        "type": "function",
                        "key": "in_bbox",
                        "value": "getBbox",
                    },
                    {
                        "type": "function",
                        "key": "zoom",
                        "value": "getZoom",
                    },
                    {
                        "type": "string",
                        "key": "year",
                        "value": available_millesimes[-1],
                    },
                    {
                        "type": "string",
                        "key": "is_artificial",
                        "value": 1,
                    },
                ],
                "min_zoom": 15,
            },
            {
                "key": "zonages-d-urbanisme-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("public_data:zoneurba-optimized"),
                    "generateId": True,  # This ensures that all features have unique IDs
                },
                "query_strings": [
                    {
                        "type": "function",
                        "key": "in_bbox",
                        "value": "getBbox",
                    },
                    {
                        "type": "function",
                        "key": "zoom",
                        "value": "getZoom",
                    },
                ],
                "min_zoom": 12,
            },
        ]
        return super().get_sources_list(*sources)

    def get_layers_list(self, *layers):
        layers = [
            {
                "id": "zonages-d-urbanisme-fill-layer",
                "z-index": 6,
                "type": "fill",
                "source": "zonages-d-urbanisme-source",
                "minzoom": 12,
                "maxzoom": 19,
                "paint": {
                    "fill-color": "#ffffff",
                    "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], False], 0.8, 0],
                },
                "events": [
                    {
                        "type": "mousemove",
                        "triggers": [
                            {
                                "method": "hoverEffectIn",
                            },
                            {
                                "method": "showInfoBox",
                                "options": {
                                    "title": "Zonages des documents d&rsquo;urbanisme",
                                    "properties": [
                                        {"name": "Libellé", "key": "libelle"},
                                        {"name": "Libellé long", "key": "libelong"},
                                        {"name": "Type de zone", "key": "typezone"},
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        "type": "mouseleave",
                        "triggers": [
                            {
                                "method": "hoverEffectOut",
                            },
                            {
                                "method": "hideInfoBox",
                            },
                        ],
                    },
                    {
                        "type": "click",
                        "triggers": [
                            {
                                "method": "displayFeatureData",
                                "options": {
                                    "data": f"/project/{self.object.pk}/carte/detail-zone-urbaine/",
                                },
                            },
                        ],
                    },
                ],
            },
            {
                "id": "ocs-ge-layer",
                "z-index": 7,
                "type": "fill",
                "source": "ocs-ge-source",
                "minzoom": 15,
                "maxzoom": 19,
                "paint": {
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], False],
                        1,
                        0.7,
                    ],
                },
                "events": [
                    {
                        "type": "mousemove",
                        "triggers": [
                            {
                                "method": "hoverEffectIn",
                            },
                            {
                                "method": "showInfoBox",
                                "options": {
                                    "title": "OCS GE",
                                    "properties": [
                                        {"name": "Code couverture", "key": "code_couverture"},
                                        {"name": "Code usage", "key": "code_usage"},
                                        {"name": "Libellé couverture", "key": "couverture_label_short"},
                                        {"name": "Libellé usage", "key": "usage_label_short"},
                                        {
                                            "name": "Surface",
                                            "key": "surface",
                                            "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                                        },
                                        {"name": "Millésime", "key": "year"},
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        "type": "mouseleave",
                        "triggers": [
                            {
                                "method": "hoverEffectOut",
                            },
                            {
                                "method": "hideInfoBox",
                            },
                        ],
                    },
                ],
            },
            {
                "id": "zonages-d-urbanisme-line-layer",
                "z-index": 8,
                "type": "line",
                "source": "zonages-d-urbanisme-source",
                "minzoom": 12,
                "maxzoom": 19,
                "paint": {
                    "line-color": [
                        "match",
                        ["get", "typezone"],
                        "N",
                        "#59b72d",
                        "U",
                        "#e60000",
                        "AUc",
                        "#ff6565",
                        "AUs",
                        "#feccbe",
                        "#ffff00",  # Default color => zones A
                    ],
                    "line-width": 1,
                },
            },
            {
                "id": "zonages-d-urbanisme-labels",
                "z-index": 9,
                "type": "symbol",
                "source": "zonages-d-urbanisme-source",
                "minzoom": 12,
                "maxzoom": 19,
                "layout": {
                    "text-field": ["get", "typezone"],
                    "text-anchor": "top",
                    "text-font": ["Marianne Regular"],
                },
                "paint": {
                    "text-color": [
                        "match",
                        ["get", "typezone"],
                        "N",
                        "#59b72d",
                        "U",
                        "#e60000",
                        "AUc",
                        "#ff6565",
                        "AUs",
                        "#feccbe",
                        "#ffff00",  # Default color => zones A
                    ],
                },
            },
        ]
        return super().get_layers_list(*layers)

    def get_filters_list(self, *filters):
        available_millesimes = self.object.get_available_millesimes(commit=True)
        available_millesimes_options = []
        for millesime in available_millesimes:
            available_millesimes_options.append(
                {
                    "name": millesime,
                    "value": millesime,
                    "data-value": millesime,
                }
            )
        usage_colors = ["match", ["get", "code_usage"]]
        for leaf in UsageSol.get_leafs():
            usage_colors.append(leaf.code_prefix)
            usage_colors.append(leaf.map_color)
        usage_colors.append("rgba(0, 0, 0, 0)")  # default color
        couverture_colors = ["match", ["get", "code_couverture"]]
        for leaf in CouvertureSol.get_leafs():
            couverture_colors.append(leaf.code_prefix)
            couverture_colors.append(leaf.map_color)
        couverture_colors.append("rgba(0, 0, 0, 0)")  # default color
        filters = [
            {
                "name": "Zonages des documents d&rsquo;urbanisme",
                "z-index": 4,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": [
                                    "zonages-d-urbanisme-line-layer",
                                    "zonages-d-urbanisme-labels",
                                    "zonages-d-urbanisme-fill-layer",
                                ],
                            },
                        ],
                    },
                    {
                        "name": "Opacité du calque",
                        "type": "opacity",
                        "value": 100,
                        "triggers": [
                            {
                                "method": "changePaintProperty",
                                "property": "line-opacity",
                                "items": ["zonages-d-urbanisme-line-layer"],
                            },
                            {
                                "method": "changePaintProperty",
                                "property": "text-opacity",
                                "items": ["zonages-d-urbanisme-labels"],
                            },
                        ],
                    },
                    {
                        "name": "",
                        "type": "tag",
                        "value": ["AUc", "AUs", "U", "A", "N"],
                        "options": [
                            {
                                "name": "AUc",
                                "value": "AUc",
                            },
                            {
                                "name": "AUs",
                                "value": "AUs",
                            },
                            {
                                "name": "U",
                                "value": "U",
                            },
                            {
                                "name": "A",
                                "value": "A",
                            },
                            {
                                "name": "N",
                                "value": "N",
                            },
                        ],
                        "triggers": [
                            {
                                "method": "filterByPropertyInArray",
                                "property": "typezone",
                                "items": [
                                    "zonages-d-urbanisme-line-layer",
                                    "zonages-d-urbanisme-labels",
                                    "zonages-d-urbanisme-fill-layer",
                                ],
                            },
                        ],
                    },
                ],
                "source": "zonages-d-urbanisme-source",
            },
            {
                "name": "OCS GE",
                "z-index": 5,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": ["ocs-ge-layer"],
                            },
                        ],
                    },
                    {
                        "name": "Nomemclature",
                        "type": "select",
                        "value": "couverture",
                        "options": [
                            {
                                "name": "Couverture",
                                "value": "couverture",
                                "data-value": couverture_colors,
                            },
                            {
                                "name": "Usage",
                                "value": "usage",
                                "data-value": usage_colors,
                            },
                        ],
                        "triggers": [
                            {
                                "method": "changePaintProperty",
                                "property": "fill-color",
                                "items": ["ocs-ge-layer"],
                            },
                        ],
                    },
                    {
                        "name": "Millésime",
                        "type": "select",
                        "value": available_millesimes[-1],
                        "options": available_millesimes_options,
                        "triggers": [
                            {
                                "method": "updateQueryString",
                                "property": "year",
                                "items": ["ocs-ge-source"],
                            },
                        ],
                    },
                ],
                "source": "ocs-ge-source",
            },
        ]
        return super().get_filters_list(*filters)


class BaseThemeMap(GroupMixin, DetailView):
    """This is a base class for thematic map. It group together layer definition, data
    provider and gradient provider.

    Main methods:
    =============
    * get_data: return GeoJson of the features to display
    * get_data_url: return endpoint url to retrieve feature to display in the map
    * get_gradient: return JSON of the coloring scale
    * get_gradient_url: return endpoint url of the coloring scale (inc. colors)
    * get_layers_list: define the layer to be display in the map
    """

    queryset = Project.objects.all()
    template_name = "carto/theme_map.html"
    context_object_name = "project"
    scale_size = 5
    title = "To be set"
    url_name = "to be set"

    def get_data_url(self):
        start = reverse_lazy(f"project:{self.url_name}", args=[self.object.id])
        return f"{start}?data=1"

    def get_gradient_url(self):
        start = reverse_lazy(f"project:{self.url_name}", args=[self.object.id])
        return f"{start}?gradient=1"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"title": self.title},
        ]
        return breadcrumbs

    def get_gradient(self):
        raise NotImplementedError("You need build gradient scale.")

    def get_data(self):
        raise NotImplementedError("You need build gradient scale.")

    def get_layers_list(self, *layers):
        layers = [
            {
                "name": "Emprise du projet",
                "url": (f'{reverse_lazy("project:emprise-list")}' f"?id={self.object.pk}"),
                "display": True,
                "style": "style_emprise",
                "fit_map": True,
                "level": "5",
            },
        ] + list(layers)
        return layers

    def get_context_data(self, **kwargs):
        center = self.object.get_centroid()
        kwargs.update(
            {
                # center map on France
                "map_name": self.title,
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 12,
                "layer_list": self.get_layers_list(),
            }
        )
        return super().get_context_data(**kwargs)

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if "gradient" in self.request.GET:
            return self.get_gradient()
        elif "data" in self.request.GET:
            return self.get_data()
        else:
            context = self.get_context_data(object=self.object)
            return self.render_to_response(context)


class MyArtifMapView(BaseMap):
    title = "Comprendre l'artificialisation du territoire"
    default_zoom = 10

    def get_sources_list(self, *sources):
        years = (
            self.object.cities.all().first().communediff_set.all().aggregate(old=Max("year_old"), new=Max("year_new"))
        )
        sources = [
            {
                "key": "zones-artificielles-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("public_data:artificialarea-optimized"),
                    "generateId": True,  # This ensures that all features have unique IDs
                    "tolerance": 0
                },
                "query_strings": [
                    {
                        "type": "function",
                        "key": "in_bbox",
                        "value": "getBbox",
                    },
                    {
                        "type": "string",
                        "key": "year",
                        "value": years["new"],
                    },
                    {
                        "type": "string",
                        "key": "project_id",
                        "value": self.object.pk,
                    },
                ],
                "min_zoom": 12,
            },
            {
                "key": "ocsge-diff-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("public_data:ocsgediff-optimized"),
                    "generateId": True,  # This ensures that all features have unique IDs
                },
                "query_strings": [
                    {
                        "type": "string",
                        "key": "year_old",
                        "value": years["old"],
                    },
                    {
                        "type": "string",
                        "key": "year_new",
                        "value": years["new"],
                    },
                    {
                        "type": "string",
                        "key": "project_id",
                        "value": self.object.pk,
                    },
                    {
                        "type": "string",
                        "key": "is_new_artif",
                        "value": True,
                    },
                    {
                        "type": "string",
                        "key": "is_new_natural",
                        "value": True,
                    },
                ],
                "min_zoom": 10,
            },
            {
                "key": "ocsge-diff-centroids-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("public_data:ocsgeDiffCentroids-optimized"),
                    "generateId": True,  # This ensures that all features have unique IDs
                    "cluster": True,
                    "clusterMaxZoom": 14,
                    "clusterRadius": 70,
                    "clusterProperties": {
                        # Keep separate sum
                        "sumArtif": ["+", ['case', ["==", ["get", "is_new_artif"], True], ["get", "surface"], 0]],
                        "sumRenat": ["+", ['case', ["==", ["get", "is_new_natural"], True], ["get", "surface"], 0]]
                    },
                    "filter": ["any",
                        ["==", ["get", "is_new_natural"], True],
                        ["==", ["get", "is_new_artif"], True],
                    ],
                },
                "query_strings": [
                    {
                        "type": "string",
                        "key": "year_old",
                        "value": years["old"],
                    },
                    {
                        "type": "string",
                        "key": "year_new",
                        "value": years["new"],
                    },
                    {
                        "type": "string",
                        "key": "project_id",
                        "value": self.object.pk,
                    },
                    {
                        "type": "string",
                        "key": "is_new_artif",
                        "value": True,
                    },
                    {
                        "type": "string",
                        "key": "is_new_natural",
                        "value": True,
                    },
                ],
                "min_zoom": 6,
                "triggers": [
                    {
                        "method": "displayDonutsChartClusters",
                        "options": {
                            "colors": ["#FC4F4F", "#43d360"],
                            "props": ["sumArtif", "sumRenat"],
                            "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                        }
                    }
                ]
            },
        ]
        return super().get_sources_list(*sources)

    def get_layers_list(self, *layers):
        layers = [
            {
                "id": "zones-artificielles-fill-layer",
                "z-index": 6,
                "type": "fill",
                "source": "zones-artificielles-source",
                "minzoom": 12,
                "maxzoom": 19,
                "paint": {
                    "fill-color": "#f88e55",
                    "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], False], 1, 0.7],
                },
                "events": [
                    {
                        "type": "mousemove",
                        "triggers": [
                            {
                                "method": "hoverEffectIn",
                            },
                            {
                                "method": "showInfoBox",
                                "options": {
                                    "title": "Zones artificielles",
                                    "properties": [
                                        {"name": "Commune", "key": "city"},
                                        {
                                            "name": "Surface",
                                            "key": "surface",
                                            "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                                        },
                                        {"name": "Millésime", "key": "year"},
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        "type": "mouseleave",
                        "triggers": [
                            {
                                "method": "hoverEffectOut",
                            },
                            {
                                "method": "hideInfoBox",
                            },
                        ],
                    },
                ],
            },
            {
                "id": "ocsge-diff-fill-layer",
                "z-index": 7,
                "type": "fill",
                "source": "ocsge-diff-source",
                "minzoom": 10,
                "maxzoom": 19,
                "paint": {
                    "fill-color": [
                        "case",
                        ["==", ["get", "is_new_natural"], True],
                        "#43d360",
                        "#FC4F4F", # Default color => zones is_new_artif
                    ],
                    "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], False], 1, 0.7],
                },
                "legend": {
                    "title": "Différentiel OCS GE",
                    "type": "raw",
                    "data": [
                        {
                            "value": "Zones artificialisées",
                            "color": "#FC4F4F",
                        },
                        {
                            "value": "Zones renaturées",
                            "color": "#43d360",
                        }
                    ],
                },
                "events": [
                    {
                        "type": "mousemove",
                        "triggers": [
                            {
                                "method": "hoverEffectIn",
                            },
                            {
                                "method": "showArtifInfoBox",
                                "options": {
                                    "title": "Différentiel OCS GE",
                                },
                            },
                        ],
                    },
                    {
                        "type": "mouseleave",
                        "triggers": [
                            {
                                "method": "hoverEffectOut",
                            },
                            {
                                "method": "hideInfoBox",
                            },
                        ],
                    },
                ],
            },
            {
                "id": "ocsge-diff-circle-layer",
                "z-index": 8,
                "type": "circle",
                "source": "ocsge-diff-centroids-source",
                "minzoom": 6,
                "maxzoom": 14,
                'filter': ['!=', 'cluster', True],
                "paint": {
                    "circle-color": [
                        "case",
                        ["==", ["get", "is_new_natural"], True],
                        "#43d360",
                        "#FC4F4F", # Default color => zones is_new_artif
                    ],
                    "circle-radius": 12,
                    "circle-opacity": 0.6,
                },
            },
            {
                "id": "ocsge-diff-label-layer",
                "z-index": 9,
                "type": "symbol",
                "source": "ocsge-diff-centroids-source",
                "minzoom": 6,
                "maxzoom": 14,
                'filter': ['!=', 'cluster', True],
                "layout": {
                    "text-field": [
                        "concat",
                        [
                            "number-format",
                            ["get", "surface"],
                            { "locale": "fr-FR", "unit": "hectare", "max-fraction-digits": 2 }
                        ],
                        " ha"
                    ],
                    "text-font": ["Marianne Regular"],
                    "text-size": 10,
                },
                "paint": {
                    "text-color": "#fff"
                }
            },
        ]
        return super().get_layers_list(*layers)

    def get_filters_list(self, *filters):
        filters = [
            {
                "name": "Zones artificielles",
                "z-index": 4,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": [
                                    "zones-artificielles-fill-layer",
                                ],
                            },
                        ],
                    },
                    {
                        "name": "Opacité du calque",
                        "type": "opacity",
                        "value": 70,
                        "triggers": [
                            {
                                "method": "changePaintProperty",
                                "property": "fill-opacity",
                                "items": ["zones-artificielles-fill-layer"],
                            },
                        ],
                    },
                ],
                "source": "zones-artificielles-source",
            },
            {
                "name": "Différentiel OCS GE",
                "z-index": 5,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": [
                                    "ocsge-diff-fill-layer",
                                    "ocsge-diff-circle-layer",
                                    "ocsge-diff-label-layer"
                                ],
                            },
                        ],
                    },
                ],
                "source": "ocsge-diff-source",
            },
        ]
        return super().get_filters_list(*filters)


class CitySpaceConsoMapView(BaseMap):
    title = "Consommation d'espaces des communes de mon territoire"
    scale_size = 5
    default_zoom = 10

    def get_sources_list(self, *sources):
        sources = [
            {
                "key": "consommation-des-communes-source",
                "params": {
                    "type": "geojson",
                    "data": reverse_lazy("project:theme-city-conso", args=[self.object.id]),
                },
                "query_strings": [
                    {
                        "type": "string",
                        "key": "data",
                        "value": 1,
                    },
                    {
                        "type": "function",
                        "key": "in_bbox",
                        "value": "getBbox",
                    },
                ],
                "min_zoom": 8,
            },
        ]
        return super().get_sources_list(*sources)

    def get_layers_list(self, *layers):
        layers = [
            {
                "id": "consommation-des-communes-fill-layer",
                "z-index": 4,
                "type": "fill",
                "source": "consommation-des-communes-source",
                "minzoom": 8,
                "maxzoom": 19,
                "paint": {
                    "fill-color": self.get_gradient_expression(),
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], False],
                        0.8,
                        0.6,
                    ],
                },
                "legend": {
                    "title": "Consommation des communes",
                    "subtitle": (
                        f"Surface consommée de {self.object.analyse_start_date} à {self.object.analyse_end_date}"
                    ),
                    "type": "scale",
                    "data": self.get_gradient_scale(),
                    "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                },
                "events": [
                    {
                        "type": "mousemove",
                        "triggers": [
                            {
                                "method": "hoverEffectIn",
                            },
                            {
                                "method": "showInfoBox",
                                "options": {
                                    "title": "Consommation des communes",
                                    "properties": [
                                        {"name": "Commune", "key": "name"},
                                        {"name": "Code INSEE", "key": "insee"},
                                        {
                                            "name": "Surface consommée",
                                            "key": "artif_area",
                                            "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        "type": "mouseleave",
                        "triggers": [
                            {
                                "method": "hoverEffectOut",
                            },
                            {
                                "method": "hideInfoBox",
                            },
                        ],
                    },
                ],
            },
        ]
        return super().get_layers_list(*layers)

    def get_filters_list(self, *filters):
        filters = [
            {
                "name": "Consommation des communes",
                "z-index": 3,
                "filters": [
                    {
                        "name": "Visibilité du calque",
                        "type": "visibility",
                        "value": "visible",
                        "triggers": [
                            {
                                "method": "changeLayoutProperty",
                                "property": "visibility",
                                "items": ["consommation-des-communes-fill-layer"],
                            },
                            {
                                "method": "toggleLegend",
                                "property": "visible",
                                "items": ["legend-box-consommation-des-communes-source"],
                            },
                        ],
                    },
                ],
                "source": "fond-de-carte-source",
            },
        ]
        return super().get_filters_list(*filters)

    def get_gradient_scale(self):
        fields = Cerema.get_art_field(self.object.analyse_start_date, self.object.analyse_end_date)
        qs = (
            self.object.get_cerema_cities()
            .annotate(conso=sum([F(f) for f in fields]) / 10000)
            .values("city_name")
            .annotate(conso=Sum(F("conso")))
            .order_by("conso")
        )
        if qs.count() <= self.scale_size:
            boundaries = sorted([i["conso"] for i in qs])
        else:
            boundaries = jenks_breaks([i["conso"] for i in qs], n_classes=self.scale_size)[1:]
        data = [{"value": v, "color": c.hex_l} for v, c in zip(boundaries, get_dark_blue_gradient(len(boundaries)))]
        return data

    def get_gradient_expression(self):
        data = [
            "interpolate",
            ["linear"],
            ["get", "artif_area"],
        ]
        for scale in self.get_gradient_scale():
            data.append(scale["value"])
            data.append(scale["color"])
        return data

    def get_data(self):
        project = self.get_object()
        fields = Cerema.get_art_field(project.analyse_start_date, project.analyse_end_date)
        qs = Cerema.objects.annotate(artif_area=sum(F(f) for f in fields))
        queryset = project.cities.all().annotate(
            artif_area=Subquery(qs.filter(city_insee=OuterRef("insee")).values("artif_area")[:1]) / 10000
        )
        bbox = self.request.GET.get("bbox", None)
        if bbox is not None and len(bbox) > 0:
            polygon_box = Polygon.from_bbox(bbox.split(","))
            queryset = queryset.filter(mpoly__within=polygon_box)
        serializer = CitySpaceConsoMapSerializer(queryset, many=True)
        return JsonResponse(serializer.data, status=200)

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if "data" in self.request.GET:
            return self.get_data()
        else:
            context = self.get_context_data(object=self.object)
            return self.render_to_response(context)


class CityArtifMapView(BaseThemeMap):
    title = "Artificialisation des communes de mon territoire"
    url_name = "theme-city-artif"

    def get_layers_list(self, *layers):
        layers = [
            {
                "name": self.title,
                "url": self.get_data_url(),
                "display": True,
                "gradient_url": self.get_gradient_url(),
                "level": "2",
                "color_property_name": "surface_artif",
            },
        ] + list(layers)
        return super().get_layers_list(*layers)

    def get_gradient(self):
        boundaries = (
            self.object.cities.all()
            .filter(surface_artif__isnull=False)
            .annotate(artif=Cast("surface_artif", output_field=FloatField()))
            .order_by("artif")
            .values_list("artif", flat=True)
        )
        if len(boundaries) == 0:
            boundaries = [1]
        elif len(boundaries) > self.scale_size:
            boundaries = jenks_breaks(boundaries, n_classes=self.scale_size)[1:]
        data = [{"value": v, "color": c.hex_l} for v, c in zip(boundaries, get_yellow2red_gradient(len(boundaries)))]
        return JsonResponse(data, safe=False)

    def get_data(self):
        queryset = self.object.cities.all()
        bbox = self.request.GET.get("bbox", None)
        if bbox is not None and len(bbox) > 0:
            polygon_box = Polygon.from_bbox(bbox.split(","))
            queryset = queryset.filter(mpoly__within=polygon_box)
        serializer = CityArtifMapSerializer(queryset, many=True)
        return JsonResponse(serializer.data, status=200)
