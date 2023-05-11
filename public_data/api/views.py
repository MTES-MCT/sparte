"""Public data API views."""
import json
from typing import Dict

from django.db import connection
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_gis import filters

from public_data import models
from utils.functions import decimal2float

from . import serializers

# OCSGE layers viewssets


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


class ZoomSimplificationMixin:
    start_zoom_simplification = 13

    def get_zoom(self):
        try:
            return int(self.request.query_params.get("zoom"))
        except TypeError:
            raise ValueError("zoom parameter must be set.")

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox")
        if bbox is None:
            raise ValueError(f"bbox parameter must be set. bbox={bbox}")
        bbox = list(map(float, bbox.split(",")))
        return bbox  # /!\ order matter, see sql query below

    def get_optimized_geo_field(self):
        zoom = self.get_zoom()
        if zoom > self.start_zoom_simplification:
            return "st_AsGeoJSON(o.mpoly, 6, 0)"
        else:
            a = ((0.05 - 0.00000001) / (6 - self.start_zoom_simplification))
            b = 0.05 - a * 6
            y = a * zoom + b
            return f"st_AsGeoJSON(ST_SimplifyPreserveTopology(o.mpoly, {y}), 6, 0)"

    def get_sql_where(self):
        return "where o.mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326)"


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


class OcsgeViewSet(OptimizedMixins, DataViewSet):
    queryset = models.Ocsge.objects.all()
    serializer_class = serializers.OcsgeSerializer
    optimized_fields = {
        # "o.id": "id",
        "o.couverture_label": "couverture_label",
        "o.usage_label": "usage_label",
        "t.map_color": "map_color",
        "o.surface": "surface",
        "o.year": "year",
    }

    def get_queryset(self):
        """
        Optionally restricts the returned polygon to those of a specific year
        """
        qs = self.queryset
        year = self.request.query_params.get("year")
        if year:
            qs = qs.filter(year=year)
        return qs

    def clean_surface(self, value):
        try:
            value = value / 10000
            value = int(value * 100) / 100
        except TypeError:
            value = 0
        return value

    def get_sql_from(self):
        if self.request.query_params.get("color") == "usage":
            table_name = models.UsageSol._meta.db_table
            field = "usage"
        else:
            table_name = models.CouvertureSol._meta.db_table
            field = "couverture"
        return (
            f"FROM {self.queryset.model._meta.db_table} o "
            f"INNER JOIN {table_name} t "
            f"ON t.code_prefix = o.{field} "
        )


class OcsgeDiffViewSet(OptimizedMixins, DataViewSet):
    queryset = models.OcsgeDiff.objects.all()
    serializer_class = serializers.OcsgeDiffSerializer
    optimized_fields = {
        # "o.id": "id",
        "CONCAT(cs_old, ' ', cs_old_label)": "cs_old",
        "CONCAT(us_old, ' ', us_old_label)": "us_old",
        "CONCAT(cs_new, ' ', cs_new_label)": "cs_new",
        "CONCAT(us_new, ' ', us_new_label)": "us_new",
        "year_new": "year_new",
        "year_old": "year_old",
        "is_new_artif": "is_new_artif",
        "is_new_natural": "is_new_natural",
        "surface / 10000": "surface",
    }

    def get_sql_where(self):
        return (
            "where year_new = %s and year_old = %s "
            "    and mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326) "
            "    and is_new_artif = %s "
            "    and is_new_natural = %s "
            "    and ST_Intersects(mpoly, ("
            "        SELECT ST_Union(mpoly) FROM project_emprise WHERE project_id = %s"
            "    ))"
        )

    def get_params(self, request):
        project_id = request.query_params.get("project_id")
        bbox = request.query_params.get("in_bbox").split(",")
        bbox = list(map(float, bbox))
        year_old = int(request.query_params.get("year_old"))
        year_new = int(request.query_params.get("year_new"))
        is_new_artif = bool(request.query_params.get("is_new_artif", False))
        is_new_natural = bool(request.query_params.get("is_new_natural", False))
        # /!\ order matter, see sql query
        return [year_new, year_old] + bbox + [is_new_artif, is_new_natural, project_id]


class ZoneConstruiteViewSet(OptimizedMixins, DataViewSet):
    queryset = models.ZoneConstruite.objects.all()
    serializer_class = serializers.ZoneConstruiteSerializer
    optimized_fields = {
        "id": "id",
        "surface": "surface",
        "year": "year",
        "built_density": "Densité",
    }


class ArtificialAreaViewSet(OptimizedMixins, DataViewSet):
    queryset = models.ArtificialArea.objects.all()
    serializer_class = serializers.OcsgeDiffSerializer
    optimized_fields = {
        "o.id": "id",
        "c.name": "city",
        "o.surface": "surface",
        "o.year": "year",
    }
    optimized_geo_field = "st_AsGeoJSON(ST_Intersection(o.mpoly, t.geom), 8)"

    def get_sql_from(self):
        return (
            f"from {self.queryset.model._meta.db_table} o "
            f"inner join {models.Commune._meta.db_table} c "
            "on o.city_id = c.id, "
            "(SELECT ST_Union(mpoly) as geom FROM project_emprise WHERE project_id = %s) as t"
        )

    def get_sql_where(self):
        return (
            "where ST_Intersects(o.mpoly, t.geom) "
            "    and ST_Area(ST_Transform(ST_Intersection(o.mpoly, t.geom), 2154)) > 0.5"
        )

    def get_params(self, request):
        return [request.query_params.get("project_id")]


# Views for referentials Couverture and Usage


class UsageSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = models.UsageSol.objects.all()
    serializer_class = serializers.UsageSolSerializer


class CouvertureSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = models.CouvertureSol.objects.all()
    serializer_class = serializers.CouvertureSolSerializer


# Views for french adminisitrative territories


class RegionViewSet(ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    queryset = models.Region.objects.all()
    serializer_class = serializers.RegionSerializer
    geo_field = "mpoly"
    optimized_fields = {}
    start_zoom_simplification = 18



class DepartementViewSet(ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    queryset = models.Departement.objects.all()
    serializer_class = serializers.DepartementSerializer
    geo_field = "mpoly"
    optimized_fields = {}
    start_zoom_simplification = 18


class ScotViewSet(ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    queryset = models.Scot.objects.all()
    serializer_class = serializers.ScotSerializer
    geo_field = "mpoly"
    start_zoom_simplification = 18


class EpciViewSet(ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    """EPCI view set."""

    queryset = models.Epci.objects.all()
    serializer_class = serializers.EpciSerializer
    geo_field = "mpoly"

    def get_optimized_geo_field(self):
        zoom = self.get_zoom()
        if zoom >= 16:
            return "st_AsGeoJSON(o.mpoly, 6, 0)"
        elif zoom >= 13:
            y = 0.0001
        elif zoom >= 10:
            y = 0.001
        else:
            y = 0.0075
        return f"st_AsGeoJSON(ST_SimplifyPreserveTopology(o.mpoly, {y}), 6, 0)"


class CommuneViewSet(ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    """Commune view set."""

    queryset = models.Commune.objects.all()
    serializer_class = serializers.CommuneSerializer
    geo_field = "mpoly"
    optimized_fields = {}

    def get_optimized_geo_field(self):
        zoom = self.get_zoom()
        if zoom >= 16:
            return "st_AsGeoJSON(o.mpoly, 6, 0)"
        elif zoom >= 13:
            y = 0.0001
        elif zoom >= 10:
            y = 0.001
        else:
            y = 0.008
        return f"st_AsGeoJSON(ST_SimplifyPreserveTopology(o.mpoly, {y}), 6, 0)"
