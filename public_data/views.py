import json
from typing import Dict

from django.db import connection
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework_gis import filters

from public_data import models, serializers
from public_data.models.administration import Land
from public_data.throttles import SearchLandApiThrottle
from utils.functions import decimal2float


class OptimizedMixins:
    optimized_fields: Dict[str, str] = {}
    optimized_geo_field = "st_AsGeoJSON(o.mpoly, 6, 0)"

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox")
        year = request.query_params.get("year")
        if bbox is None or year is None:
            raise ValueError(f"bbox and year parameter must be set. bbox={bbox};year={year}")
        bbox = list(map(float, bbox.split(",")))
        year = int(year)
        return [year] + bbox  # /!\ order matter, see sql query below

    def get_optimized_geo_field(self):
        return self.optimized_geo_field

    def get_sql_fields(self):
        return list(self.optimized_fields.keys()) + [self.get_optimized_geo_field()]

    def get_field_names(self):
        return list(self.optimized_fields.values()) + ["geojson"]

    def get_sql_select(self):
        return f"select {', '.join(self.get_sql_fields())}"

    def get_sql_from(self):
        return f"from {self.queryset.model._meta.db_table} o"

    def get_sql_where(self):
        return "where o.year = %s and o.mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326)"

    def get_sql_query(self):
        return " ".join(
            [
                self.get_sql_select(),
                self.get_sql_from(),
                self.get_sql_where(),
            ]
        )

    def get_data(self, request):
        query = self.get_sql_query()
        params = self.get_params(request)
        fields_names = self.get_field_names()
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return [{name: row[i] for i, name in enumerate(fields_names)} for row in cursor.fetchall()]

    def clean_properties(self, props):
        cleaned_props = dict()
        for name, val in props.items():
            try:
                clean_method = getattr(self, f"clean_{name}")
                cleaned_props[name] = clean_method(val)
            except AttributeError:
                # no cleaning required
                cleaned_props[name] = val
        return cleaned_props

    @action(detail=False)
    def optimized(self, request):
        try:
            envelope = json.dumps(
                {
                    "type": "FeatureCollection",
                    "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                    "features": "-features-",
                }
            )
            features = []
            for row in self.get_data(request):
                geojson = row.pop("geojson")
                feature = json.dumps(
                    {
                        "type": "Feature",
                        "properties": self.clean_properties(row),
                        "geometry": "-geometry-",
                    },
                    default=decimal2float,
                )
                feature = feature.replace('"-geometry-"', geojson)
                features.append(feature)
            features = f" [{', '.join(features)}]"
            envelope = envelope.replace('"-features-"', features)
        except ValueError as exc:
            envelope = json.dumps(
                {
                    "error": {
                        "type": "ValueError",
                        "message": str(exc),
                    }
                }
            )
        return HttpResponse(envelope, content_type="application/json")


class OnlyBoundingBoxMixin:
    optimized_geo_field = "st_AsGeoJSON(ST_Intersection(ST_MakeValid(mpoly), b.box), 6, 0)"

    def get_sql_from(self) -> str:
        from_parts = [
            super().get_sql_from(),  # type: ignore
            "INNER JOIN (SELECT ST_MakeEnvelope(%s, %s, %s, %s, 4326) as box) as b ON ST_Intersects(o.mpoly, b.box)",
        ]
        return " ".join(from_parts)

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox")
        if bbox is None:
            raise ValueError(f"bbox parameter must be set. bbox={bbox}")
        bbox = list(map(float, bbox.split(",")))
        return bbox  # /!\ order matter, see sql query 'from' above


class ZoomSimplificationMixin:
    min_zoom = 6

    def get_zoom(self):
        try:
            return int(self.request.query_params.get("zoom"))
        except TypeError:
            raise ValueError("zoom parameter must be set.")

    def get_data(self, request):
        if self.get_zoom() >= self.min_zoom:
            return super().get_data(request)
        return []


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


# Views for referentials Couverture and Usage


# Views for french adminisitrative territories


class DepartementViewSet(DataViewSet):
    queryset = models.Departement.objects.all()
    serializer_class = serializers.DepartementSerializer


class grid_view(APIView):
    def get(self, request, format=None):
        """Return a grid of squares of 1000 size and inside a given bbox."""

        params = [int(request.query_params.get("gride_size", "1000")) * 0.008983]
        bbox = request.query_params.get("in_bbox").split(",")
        params += list(map(float, bbox))

        query = (
            "SELECT st_AsGeoJSON(squares.geom, 6, 0) as mpoly "
            "FROM ST_SquareGrid(%s, ST_MakeEnvelope(%s, %s, %s, %s, 4326)) AS squares"
        )

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            geojson = {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "features": [
                    {
                        "type": "Feature",
                        "geometry": json.loads(row[0]),
                    }
                    for row in cursor.fetchall()
                ],
            }

        return Response(geojson)


class SearchLandApiView(GenericViewSet):
    serializer_class = serializers.SearchLandSerializer
    throttle_classes = [SearchLandApiThrottle]

    def post(self, request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        needle = serializer.validated_data["needle"]

        results = Land.search(needle, search_for="*")
        output = serializers.LandSerializer(results, many=True).data

        return Response(data=output)
