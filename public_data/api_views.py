"""Public data API views."""
import json

from django.db import connection
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_gis import filters

from .models import (
    Artificialisee2015to2018,
    Artificielle2018,
    CommunesSybarval,
    CouvertureSol,
    EnveloppeUrbaine2018,
    Ocsge,
    Renaturee2018to2015,
    Sybarval,
    UsageSol,
    Voirie2018,
    ZonesBaties2018,
)
from .serializers import (
    Artificialisee2015to2018Serializer,
    Artificielle2018Serializer,
    CommunesSybarvalSerializer,
    CouvertureSolSerializer,
    EnveloppeUrbaine2018Serializer,
    OcsgeSerializer,
    Renaturee2018to2015Serializer,
    SybarvalSerializer,
    UsageSolSerializer,
    Voirie2018Serializer,
    ZonesBaties2018Serializer,
)


class DataViewSet(viewsets.ReadOnlyModelViewSet):
    bbox_filter_field = "mpoly"
    bbox_filter_include_overlapping = True
    filter_backends = (filters.InBBoxFilter,)

    @action(detail=False, methods=["get"])
    def gradient(self, request):
        property_name = color_name = None
        if "property_name" in request.query_params:
            property_name = str(request.query_params["property_name"])
        if "color_name" in request.query_params:
            color_name = str(request.query_params["color_name"])
        gradient = self.queryset.model.get_gradient(
            property_name=property_name,
            color_name=color_name,
        )
        gradient = [{"value": int(k), "color": v.hex_l} for k, v in gradient.items()]
        return Response(gradient)


class EnveloppeUrbaine2018ViewSet(DataViewSet):
    queryset = EnveloppeUrbaine2018.objects.all()
    serializer_class = EnveloppeUrbaine2018Serializer


class Artificialisee2015to2018ViewSet(DataViewSet):
    queryset = Artificialisee2015to2018.objects.all()
    serializer_class = Artificialisee2015to2018Serializer


class Artificielle2018ViewSet(DataViewSet):
    queryset = Artificielle2018.objects.all()
    serializer_class = Artificielle2018Serializer


class CommunesSybarvalViewSet(DataViewSet):
    """CommunesSybarval view set."""

    queryset = CommunesSybarval.objects.all()
    serializer_class = CommunesSybarvalSerializer

    @action(detail=True)
    def ocsge(self, request, pk):
        year = request.query_params["year"]
        commune = self.get_object()
        params = list(commune.mpoly.extent)
        params.append(year)
        query = (
            "SELECT id, couverture_label, usage_label, millesime, map_color, "
            "year, st_AsGeoJSON(mpoly, 4) AS geojson "
            f"FROM {Ocsge._meta.db_table} "
            "WHERE mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326) "
            "AND year = %s"
        )
        features = []
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            for row in cursor.fetchall():
                feature = {
                    "type": "Feature",
                    "properties": {
                        "id": row[0],
                        "couverture_label": row[1],
                        "usage_label": row[2],
                        "millesime": row[3].strftime("%Y-%m-%d"),
                        "map_color": row[4],
                        "year": row[5],
                    },
                    "geometry": json.loads(row[6]),
                }
                features.append(feature)
        geojson = {
            "type": "FeatureCollection",
            "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
            "features": features,
        }
        return Response(geojson)


class CouvertureSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = CouvertureSol.objects.all()
    serializer_class = CouvertureSolSerializer


class OcsgeViewSet(DataViewSet):
    queryset = Ocsge.objects.all()
    serializer_class = OcsgeSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned polygon to those of a specific year
        """
        qs = self.queryset
        year = self.request.query_params.get("year")
        if year:
            qs = qs.filter(year=year)
        return qs

    def get_data(self, bbox=None, year=2015, color="usage"):
        if color == "usage":
            table_name = UsageSol._meta.db_table
            field = "usage"
        else:
            table_name = CouvertureSol._meta.db_table
            field = "couverture"
        query = (
            "SELECT o.id, o.couverture_label, o.usage_label, o.millesime, t.map_color, "
            "o.year, st_AsGeoJSON(o.mpoly, 4) AS geojson "
            f"FROM {Ocsge._meta.db_table} o "
            f"INNER JOIN {table_name} t ON t.code_prefix = o.{field} "
            "WHERE o. mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326) "
            "AND o.year = %s"
        )
        params = bbox + [year]
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()
        return rows

    @action(detail=False)
    def optimized(self, request):
        bbox = request.query_params.get("in_bbox").split(",")
        bbox = list(map(float, bbox))
        data = self.get_data(
            bbox=bbox,
            year=int(request.query_params.get("year")),
            color=request.query_params.get("color"),
        )
        geojson = json.dumps(
            {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "features": "-features-",
            }
        )
        features = []
        for row in data:
            feature = json.dumps(
                {
                    "type": "Feature",
                    "properties": {
                        "id": row[0],
                        "couverture_label": row[1],
                        "usage_label": row[2],
                        "millesime": row[3].strftime("%Y-%m-%d"),
                        "map_color": row[4],
                        "year": row[5],
                    },
                    "geometry": "-geometry-",
                }
            )
            feature = feature.replace('"-geometry-"', row[6])
            features.append(feature)
        features = f" [{', '.join(features)}]"
        geojson = geojson.replace('"-features-"', features)
        # return Response(geojson)
        return HttpResponse(geojson, content_type="application/json")


class Renaturee2018to2015ViewSet(DataViewSet):
    queryset = Renaturee2018to2015.objects.all()
    serializer_class = Renaturee2018to2015Serializer


class SybarvalViewSet(DataViewSet):
    queryset = Sybarval.objects.all()
    serializer_class = SybarvalSerializer


class UsageSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = UsageSol.objects.all()
    serializer_class = UsageSolSerializer


class Voirie2018ViewSet(DataViewSet):
    queryset = Voirie2018.objects.all()
    serializer_class = Voirie2018Serializer


class ZonesBaties2018ViewSet(DataViewSet):
    queryset = ZonesBaties2018.objects.all()
    serializer_class = ZonesBaties2018Serializer
