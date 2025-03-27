import json

from django.conf import settings
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import DetailView
from jenkspy import jenks_breaks

from project.models import Project
from public_data.domain.containers import PublicDataContainer
from public_data.models import Land
from utils.colors import get_dark_blue_gradient

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

    @property
    def bounds(self):
        project: Project = self.get_object()
        return list(project.land.mpoly.extent)

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"title": self.title},
        ]
        return breadcrumbs

    def get_sources_list(self):
        return [
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
                    "url": "https://data.geopf.fr/tms/1.0.0/ADMIN_EXPRESS/metadata.json",
                },
            },
        ]

    def get_layers_list(self):
        return [
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
                    "line-width": 1,
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
        ]

    def get_filters_list(self):
        return [
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
        ]

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
                "bounds": self.bounds,
                "data": {
                    "sources": self.get_sources_list(),
                    "layers": layers,
                    "filters": filters,
                },
            }
        )
        return super().get_context_data(**kwargs)


class CitySpaceConsoMapView(BaseMap):
    title = "Consommation d'espaces des communes de mon territoire"
    scale_size = 5
    default_zoom = 10

    def get_sources_list(self):
        return super().get_sources_list() + [
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

    def get_layers_list(self):
        return super().get_layers_list() + [
            {
                "id": "consommation-des-communes-fill-layer",
                "z-index": 4,
                "type": "fill",
                "source": "consommation-des-communes-source",
                "minzoom": 3,
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
                        f"Taux de consommation de {self.object.analyse_start_date} à {self.object.analyse_end_date}"
                    ),
                    "type": "scale",
                    "data": self.get_gradient_scale(),
                    "formatter": ["number", ["fr-FR", "unit", "percent", 2]],
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
                                            "name": "Taux de consommation",
                                            "key": "artif_area_percent",
                                            "formatter": ["number", ["fr-FR", "unit", "percent", 2]],
                                        },
                                        {
                                            "name": "Surface consommée",
                                            "key": "artif_area",
                                            "formatter": ["number", ["fr-FR", "unit", "hectare", 2]],
                                        },
                                        {
                                            "name": "Surface du territoire",
                                            "key": "area",
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

    def get_filters_list(self):
        return super().get_filters_list() + [
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

    def get_gradient_scale(self):
        project: Project = self.object
        cities = project.land.get_cities()
        conso = PublicDataContainer.consommation_stats_service().get_by_lands(
            lands=[Land(f"{city.land_type}_{city.official_id}") for city in cities],
            start_date=project.analyse_start_date,
            end_date=project.analyse_end_date,
        )
        if len(conso) <= self.scale_size:
            boundaries = sorted([c.total_percent_of_area for c in conso])
        else:
            boundaries = jenks_breaks([c.total_percent_of_area for c in conso], n_classes=self.scale_size)[1:]
        data = [{"value": v, "color": c.hex_l} for v, c in zip(boundaries, get_dark_blue_gradient(len(boundaries)))]
        return data

    def get_gradient_expression(self):
        data = [
            "interpolate",
            ["linear"],
            ["get", "artif_area_percent"],
        ]
        for scale in self.get_gradient_scale():
            data.append(scale["value"])
            data.append(scale["color"])
        return data

    def get_data(self):
        project: Project = self.object
        cities = project.land.get_cities()
        conso = PublicDataContainer.consommation_stats_service().get_by_lands(
            lands=[Land(f"{city.land_type}_{city.official_id}") for city in cities],
            start_date=project.analyse_start_date,
            end_date=project.analyse_end_date,
        )
        data = {"type": "FeatureCollection", "features": []}

        for c in conso:
            data["features"].append(
                {
                    "id": c.land.official_id,
                    "type": "Feature",
                    "geometry": json.loads(c.land.mpoly.geojson),
                    "properties": {
                        "name": c.land.name,
                        "area": c.land.area,
                        "artif_area": c.total,
                        "artif_area_percent": c.total_percent_of_area,
                    },
                }
            )
        return JsonResponse(data=data, status=200, safe=False)

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if "data" in self.request.GET:
            return self.get_data()
        else:
            context = self.get_context_data(object=self.object)
            return self.render_to_response(context)
