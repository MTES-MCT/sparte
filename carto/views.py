import json

from django.core.serializers import serialize
from django.http import JsonResponse  # , HttpResponse
from django.shortcuts import render
from django.urls import reverse_lazy

from .models import WorldBorder


def render_file_to_json(path):
    """Return a JSON HTTP response with the content of a file localized to path."""
    with open(path) as f:
        content = "\n".join(f.readlines())
    content = json.loads(content)
    return JsonResponse(content)


def render_map():
    pass


def arcachon(request):
    """Center the map on Arcachon"""
    context = {
        # center map on France
        "carto_name": "Arcachon",
        "center_lat": 44.6586,
        "center_lng": -1.164,
        "default_zoom": 12,
        "layer_list": [
            {
                "name": "Artificialisation 2015 à 2018",
                "url": reverse_lazy("public_data:artificialisee2015to2018-list"),
                "immediate_display": True,
            },
            {
                "name": "Zones artificielles",
                "url": reverse_lazy("public_data:artificielle2018-list"),
                "immediate_display": False,
            },
            {
                "name": "Communes SYBARVALE",
                "url": reverse_lazy("public_data:communessybarval-list"),
                "immediate_display": False,
            },
            {
                "name": "Enveloppes urbaines",
                "url": reverse_lazy("public_data:enveloppeurbaine2018-list"),
                "immediate_display": False,
            },
            {
                "name": "Renaturation de 2018 à 2015",
                "url": reverse_lazy("public_data:renaturee2018to2015-list"),
            },
            {
                "name": "Emprise Sybarval",
                "url": reverse_lazy("public_data:sybarval-list"),
                "immediate_display": False,
            },
            {
                "name": "Voirie 2018",
                "url": reverse_lazy("public_data:voirie2018-list"),
                "immediate_display": False,
            },
            {
                "name": "Zones Baties 2018",
                "url": reverse_lazy("public_data:zonesbaties2018-list"),
                "immediate_display": False,
            },
        ],
    }
    return render(request, "carto/full_carto.html", context=context)


def worldborder(request):
    """Display a map with departements"""
    url = reverse_lazy("carto:data_worldborder")
    context = {
        # center map on France
        "center_lat": 46.7111,
        "center_lng": 1.7191,
        "default_zoom": 2,
        # load departements layer
        "layer_url": f"{request.scheme}://{request.get_host()}{url}",
        "layer_name": "Pays",
    }
    return render(request, "carto/full_carto.html", context=context)


def data_worldborder(request):
    """Return the geojson departement list used to populate a map"""
    geojson = serialize("geojson", WorldBorder.objects.all())
    content = json.loads(geojson)
    return JsonResponse(content)


def departements(request):
    """Display a map with departements"""
    url = reverse_lazy("carto:data_departement")
    context = {
        # center map on France
        "carto_name": "Carte des départements",
        "center_lat": 46.7111,
        "center_lng": 1.7191,
        "default_zoom": 6,
        # load departements layer
        "layer_url": f"{request.scheme}://{request.get_host()}{url}",
        "layer_name": "Départements",
    }
    return render(request, "carto/full_carto.html", context=context)


def data_departements(request):
    """Return the geojson departement list used to populate a map"""
    return render_file_to_json("carto/static/carto/geojson/departements.geojson")
