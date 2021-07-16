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
        "default_zoom": 10,
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
