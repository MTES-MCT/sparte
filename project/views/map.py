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


class ProjectMapView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/full_carto.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Carte intéractive"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        # UPGRADE: add center and zoom fields on project model
        # values would be infered when emprise is loaded
        center = self.object.get_centroid()
        kwargs.update(
            {
                # center map on France
                "carto_name": "Project",
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 10,
                "layer_list": [
                    {
                        "name": "Communes",
                        "url": reverse_lazy("project:project-communes", args=[self.object.id]),
                        "display": False,  # afficher par défaut ou non
                        "level": "2",
                        "style": "style_communes",
                    },
                    {
                        "name": "Emprise du projet",
                        "url": reverse_lazy("project:emprise-list") + f"?id={self.object.pk}",
                        "display": True,
                        "style": "style_emprise",
                        "fit_map": True,
                        "level": "5",
                    },
                    {
                        "name": "Arcachon: Couverture 2015",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2015&color=couverture"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Arcachon: Couverture 2018",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2018&color=couverture"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Arcachon: Usage 2015",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2015&color=usage"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Arcachon: Usage 2018",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2018&color=usage"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Archachon : artificialisation 2015 à 2018",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2015&year_new=2018&is_new_artif=true"
                        ),
                        "display": False,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Arcachon : renaturation de 2015 à 2018",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2015&year_new=2018&is_new_natural=true"
                        ),
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                        "display": False,
                    },
                    {
                        "name": "Arcachon: zones artificielles 2015",
                        "url": (f'{reverse_lazy("public_data:artificialarea-optimized")}' "?year=2015"),
                        "display": False,
                        "level": "3",
                        "style": "style_zone_artificielle",
                    },
                    {
                        "name": "Arcachon: zones artificielles 2018",
                        "url": (f'{reverse_lazy("public_data:artificialarea-optimized")}' "?year=2018"),
                        "display": False,
                        "level": "3",
                        "style": "style_zone_artificielle",
                    },
                    {
                        "name": "Gers: Couverture 2016",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2016&color=couverture"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Couverture 2019",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2019&color=couverture"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Usage 2016",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2016&color=usage"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Usage 2019",
                        "url": (f'{reverse_lazy("public_data:ocsge-optimized")}' "?year=2019&color=usage"),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: artificialisation 2016 à 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2016&year_new=2019&is_new_artif=true"
                        ),
                        "display": False,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Gers: renaturation 2016 à 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2016&year_new=2019&is_new_natural=true"
                        ),
                        "display": False,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Gers: zones construites 2016",
                        "url": (f'{reverse_lazy("public_data:zoneconstruite-optimized")}' "?year=2016"),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                    {
                        "name": "Gers: zones construites 2019",
                        "url": (f'{reverse_lazy("public_data:zoneconstruite-optimized")}' "?year=2019"),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                    {
                        "name": "Gers: zones artificielles 2016",
                        "url": (f'{reverse_lazy("public_data:artificialarea-optimized")}' "?year=2016"),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                    {
                        "name": "Gers: zones artificielles 2019",
                        "url": (f'{reverse_lazy("public_data:artificialarea-optimized")}' "?year=2019"),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                ],
            }
        )
        return super().get_context_data(**kwargs)


class MapLibreView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/map_libre.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Carte intéractive"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        center = self.object.get_centroid()
        usage_colors = ["match", ["get", "code_usage"]]
        for leaf in UsageSol.get_leafs():
            usage_colors.append(leaf.code_prefix)
            usage_colors.append(leaf.map_color)
        usage_colors.append("rgba(0, 0, 0, 0)") # default color
        couverture_colors = ["match", ["get", "code_couverture"]]
        for leaf in CouvertureSol.get_leafs():
            couverture_colors.append(leaf.code_prefix)
            couverture_colors.append(leaf.map_color)
        couverture_colors.append("rgba(0, 0, 0, 0)") # default color       
        kwargs.update(
            {
                "carto_name": "Project",
                "map_name": "Explorateur des zonages des documents d&rsquo;urbanisme",
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 12,
                "data": {
                    "sources": [
                        {
                            "key": "fond-de-carte-source",
                            "params": {
                                "type": "raster",
                                "tiles": [settings.ORTHOPHOTO_URL],
                                "tileSize": 256  
                            },
                        },
                        {
                            "key": "ocs-ge-source",
                            "params": {
                                "type": "geojson",
                                "data": reverse_lazy("public_data:ocsge-optimized"),
                                "generateId": True #This ensures that all features have unique IDs   
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
                                    "value": 2019,
                                },
                                {
                                    "type": "string",
                                    "key": "is_artificial",
                                    "value": 1,
                                }
                            ],
                            "min_zoom": 15,
                        },
                        {
                            "key": "zonages-d-urbanisme-source",
                            "params": {
                                "type": "geojson",
                                "data": reverse_lazy("public_data:zoneurba-optimized"),
                                "generateId": True, # This ensures that all features have unique IDs     
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
                                }
                            ],
                            "min_zoom": 12,
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
                    ],
                    "layers": [ # order matter
                        {
                            "id": "fond-de-carte-layer",
                            "type": "raster",
                            "source": "fond-de-carte-source",
                        },
                        {
                            "id": "limites-administratives-region-layer",
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
                            "type": "line",
                            "source": "emprise-du-territoire-source",
                            "paint": {
                                "line-color": "#ffff00",
                                "line-width": 1.5,
                            },
                        },
                        {
                            "id": "zonages-d-urbanisme-fill-layer",
                            "type": "fill",
                            "source": "zonages-d-urbanisme-source",
                            "minzoom": 12,
                            "maxzoom": 19,
                            "paint": {
                                "fill-color": "#ffffff",
                                "fill-opacity": [
                                    "case",
                                    ["boolean", ["feature-state", "hover"], False],
                                    0.8,
                                    0
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
                                                "title": "Zonages des documents d&rsquo;urbanisme",
                                                "properties": [
                                                    {
                                                        "name": "Libellé",
                                                        "key": "libelle"
                                                    },
                                                    {
                                                        "name": "Libellé long",
                                                        "key": "libelong"
                                                    },
                                                    {
                                                        "name": "Type de zone",
                                                        "key": "typezone"
                                                    },
                                                ]
                                            }
                                        }
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
                                    ]
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
                                    ]
                                },
                            ]
                        },
                        {
                            "id": "ocs-ge-layer",
                            "type": "fill",
                            "source": "ocs-ge-source",
                            "minzoom": 15,
                            "maxzoom": 19,
                            "paint": {
                                "fill-opacity": [
                                    "case",
                                    ["boolean", ["feature-state", "hover"], False],
                                    1,
                                    0.7
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
                                                    {
                                                        "name": "Code couverture",
                                                        "key": "code_couverture"
                                                    },
                                                    {
                                                        "name": "Code usage",
                                                        "key": "code_usage"
                                                    },
                                                    {
                                                        "name": "Libellé couverture",
                                                        "key": "couverture_label_short"
                                                    },
                                                    {
                                                        "name": "Libellé usage",
                                                        "key": "usage_label_short"
                                                    },
                                                    {
                                                        "name": "Surface",
                                                        "key": "surface",
                                                        "formatter": ["number", ["fr-FR", "unit", "hectare", 2]]
                                                    },
                                                    {
                                                        "name": "Millésime",
                                                        "key": "year"
                                                    }
                                                ]   
                                            }
                                        }
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
                                    ]
                                },
                            ]
                        },
                        {
                            "id": "zonages-d-urbanisme-line-layer",
                            "type": "line",
                            "source": "zonages-d-urbanisme-source",
                            "minzoom": 12,
                            "maxzoom": 19,
                            "paint": {
                                "line-color": [
                                    "match",
                                    ["get", "typezone"],
                                    "N", "#59b72d",
                                    "U", "#e60000",
                                    "AUc", "#ff6565",
                                    "AUs", "#feccbe",
                                    "#ffff00", # Default color => zones A
                                ],
                                "line-width": 1,
                            },
                        },
                        {
                            "id": "zonages-d-urbanisme-labels",
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
                                    "N", "#59b72d",
                                    "U", "#e60000",
                                    "AUc", "#ff6565",
                                    "AUs", "#feccbe",
                                    "#ffff00", # Default color => zones A
                                ],
                            },
                        },
                        {
                            "id": "limites-administratives-region-labels",
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
                    ],
                    "filters": [ # order matter
                        {
                            "name": "Fond de carte",
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
                                            ]
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
                        {
                            "name": "Zonages des documents d&rsquo;urbanisme",
                            "filters": [
                                {
                                    "name": "Visibilité du calque",
                                    "type": "visibility",
                                    "value": "visible",
                                    "triggers": [
                                        {
                                            "method": "changeLayoutProperty",
                                            "property": "visibility",
                                            "items": ["zonages-d-urbanisme-line-layer", "zonages-d-urbanisme-labels", "zonages-d-urbanisme-fill-layer"],
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
                                            "items": ["zonages-d-urbanisme-line-layer", "zonages-d-urbanisme-labels", "zonages-d-urbanisme-fill-layer"],
                                        },
                                    ],
                                },
                            ],
                            "source": "zonages-d-urbanisme-source",
                        },
                        {
                            "name": "OCS GE",
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
                                    "name": "Opacité du calque",
                                    "type": "opacity",
                                    "value": 70,
                                    "triggers": [
                                        {
                                            "method": "changePaintProperty",
                                            "property": "fill-opacity",
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
                                    "value": "2019",
                                    "options": [
                                        {
                                            "name": "2016",
                                            "value": "2016",
                                            "data-value": "2016",
                                        },
                                        {
                                            "name": "2019",
                                            "value": "2019",
                                            "data-value": "2019",
                                        },
                                    ],
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
                    ],
                }
            }
        )
        return super().get_context_data(**kwargs)


class UrbanZonesMapView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/map_urban_zones.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Explorateur des zonages d'urbanisme"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        center = self.object.get_centroid()
        usage_colors = ["match", ["get", "code_usage"]]
        for leaf in UsageSol.get_leafs():
            usage_colors.append(leaf.code_prefix)
            usage_colors.append(leaf.map_color)
        usage_colors.append("rgba(0, 0, 0, 0)") # default color
        couverture_colors = ["match", ["get", "code_couverture"]]
        for leaf in CouvertureSol.get_leafs():
            couverture_colors.append(leaf.code_prefix)
            couverture_colors.append(leaf.map_color)
        couverture_colors.append("rgba(0, 0, 0, 0)") # default color       
        kwargs.update(
            {
                "carto_name": "Project",
                "map_name": "Explorateur des zonages des documents d&rsquo;urbanisme",
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 12,
                "data": {
                    "sources": [
                        {
                            "key": "fond-de-carte-source",
                            "params": {
                                "type": "raster",
                                "tiles": [settings.ORTHOPHOTO_URL],
                                "tileSize": 256  
                            },
                        },
                        {
                            "key": "ocs-ge-source",
                            "params": {
                                "type": "geojson",
                                "data": reverse_lazy("public_data:ocsge-optimized"),
                                "generateId": True #This ensures that all features have unique IDs   
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
                                    "value": 2019,
                                },
                                {
                                    "type": "string",
                                    "key": "is_artificial",
                                    "value": 1,
                                }
                            ],
                            "min_zoom": 12,
                        },
                        {
                            "key": "zonages-d-urbanisme-source",
                            "params": {
                                "type": "geojson",
                                "data": reverse_lazy("public_data:zoneurba-optimized"),
                                "generateId": True, # This ensures that all features have unique IDs     
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
                                }
                            ],
                            "min_zoom": 12,
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
                    ],
                    "layers": [ # order matter
                        {
                            "id": "fond-de-carte-layer",
                            "type": "raster",
                            "source": "fond-de-carte-source",
                        },
                        {
                            "id": "limites-administratives-region-layer",
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
                            "type": "line",
                            "source": "emprise-du-territoire-source",
                            "paint": {
                                "line-color": "#ffff00",
                                "line-width": 1.5,
                            },
                        },
                        {
                            "id": "zonages-d-urbanisme-fill-layer",
                            "type": "fill",
                            "source": "zonages-d-urbanisme-source",
                            "minzoom": 12,
                            "maxzoom": 19,
                            "paint": {
                                "fill-color": "#ffffff",
                                "fill-opacity": [
                                    "case",
                                    ["boolean", ["feature-state", "hover"], False],
                                    0.8,
                                    0
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
                                                "title": "Zonages des documents d&rsquo;urbanisme",
                                                "properties": [
                                                    {
                                                        "name": "Libellé",
                                                        "key": "libelle"
                                                    },
                                                    {
                                                        "name": "Libellé long",
                                                        "key": "libelong"
                                                    },
                                                    {
                                                        "name": "Type de zone",
                                                        "key": "typezone"
                                                    },
                                                ]
                                            }
                                        }
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
                                    ]
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
                                    ]
                                },
                            ]
                        },
                        {
                            "id": "ocs-ge-layer",
                            "type": "fill",
                            "source": "ocs-ge-source",
                            "minzoom": 12,
                            "maxzoom": 19,
                            "paint": {
                                "fill-opacity": [
                                    "case",
                                    ["boolean", ["feature-state", "hover"], False],
                                    1,
                                    0.7
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
                                                    {
                                                        "name": "Code couverture",
                                                        "key": "code_couverture"
                                                    },
                                                    {
                                                        "name": "Code usage",
                                                        "key": "code_usage"
                                                    },
                                                    {
                                                        "name": "Libellé couverture",
                                                        "key": "couverture_label_short"
                                                    },
                                                    {
                                                        "name": "Libellé usage",
                                                        "key": "usage_label_short"
                                                    },
                                                    {
                                                        "name": "Surface",
                                                        "key": "surface",
                                                        "formatter": ["number", ["fr-FR", "unit", "hectare", 2]]
                                                    },
                                                    {
                                                        "name": "Millésime",
                                                        "key": "year"
                                                    }
                                                ]   
                                            }
                                        }
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
                                    ]
                                },
                            ]
                        },
                        {
                            "id": "zonages-d-urbanisme-line-layer",
                            "type": "line",
                            "source": "zonages-d-urbanisme-source",
                            "minzoom": 12,
                            "maxzoom": 19,
                            "paint": {
                                "line-color": [
                                    "match",
                                    ["get", "typezone"],
                                    "N", "#59b72d",
                                    "U", "#e60000",
                                    "AUc", "#ff6565",
                                    "AUs", "#feccbe",
                                    "#ffff00", # Default color => zones A
                                ],
                                "line-width": 1,
                            },
                        },
                        {
                            "id": "zonages-d-urbanisme-labels",
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
                                    "N", "#59b72d",
                                    "U", "#e60000",
                                    "AUc", "#ff6565",
                                    "AUs", "#feccbe",
                                    "#ffff00", # Default color => zones A
                                ],
                            },
                        },
                        {
                            "id": "limites-administratives-region-labels",
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
                    ],
                    "filters": [ # order matter
                        {
                            "name": "Fond de carte",
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
                                            ]
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
                        {
                            "name": "Zonages des documents d&rsquo;urbanisme",
                            "filters": [
                                {
                                    "name": "Visibilité du calque",
                                    "type": "visibility",
                                    "value": "visible",
                                    "triggers": [
                                        {
                                            "method": "changeLayoutProperty",
                                            "property": "visibility",
                                            "items": ["zonages-d-urbanisme-line-layer", "zonages-d-urbanisme-labels", "zonages-d-urbanisme-fill-layer"],
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
                                            "items": ["zonages-d-urbanisme-line-layer", "zonages-d-urbanisme-labels", "zonages-d-urbanisme-fill-layer"],
                                        },
                                    ],
                                },
                            ],
                            "source": "zonages-d-urbanisme-source",
                        },
                        {
                            "name": "OCS GE",
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
                                    "name": "Opacité du calque",
                                    "type": "opacity",
                                    "value": 70,
                                    "triggers": [
                                        {
                                            "method": "changePaintProperty",
                                            "property": "fill-opacity",
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
                                    "value": "2019",
                                    "options": [
                                        {
                                            "name": "2016",
                                            "value": "2016",
                                            "data-value": "2016",
                                        },
                                        {
                                            "name": "2019",
                                            "value": "2019",
                                            "data-value": "2019",
                                        },
                                    ],
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
                    ],
                }
            }
        )
        return super().get_context_data(**kwargs)


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


class MyArtifMapView(BaseThemeMap):
    title = "Comprendre l'artificialisation du territoire"

    def get_layers_list(self, *layers):
        years = (
            self.object.cities.all().first().communediff_set.all().aggregate(old=Max("year_old"), new=Max("year_new"))
        )
        layers = list(layers) + [
            {
                "name": "Artificialisation",
                "url": (
                    f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                    f"?year_old={years['old']}&year_new={years['new']}"
                    f"&is_new_artif=true&project_id={self.object.id}"
                ),
                "display": True,
                "style": "get_color_for_ocsge_diff",
                "level": "7",
            },
            {
                "name": "Renaturation",
                "url": (
                    f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                    f"?year_old={years['old']}&year_new={years['new']}"
                    f"&is_new_natural=true&project_id={self.object.id}"
                ),
                "display": True,
                "style": "get_color_for_ocsge_diff",
                "level": "7",
            },
            {
                "name": "Zones artificielles",
                "url": (
                    f'{reverse_lazy("public_data:artificialarea-optimized")}'
                    f"?year={years['new']}&project_id={self.object.id}"
                ),
                "display": True,
                "style": "style_zone_artificielle",
                "level": "3",
            },
        ]
        return super().get_layers_list(*layers)


class CitySpaceConsoMapView(BaseThemeMap):
    title = "Consommation d'espaces des communes de mon territoire"
    url_name = "theme-city-conso"

    def get_layers_list(self, *layers):
        layers = [
            {
                "name": "Consommation des communes",
                "url": self.get_data_url(),
                "display": True,
                "gradient_url": self.get_gradient_url(),
                "level": "2",
                "color_property_name": "artif_area",
            }
        ] + list(layers)
        return super().get_layers_list(*layers)

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

    def get_gradient(self):
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
        return JsonResponse(data, safe=False)


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
