import json
from typing import Dict

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import connection
from django.http import HttpResponse
from django.urls import reverse_lazy
from django.views.generic import TemplateView
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
from utils.views_mixins import BreadCrumbMixin

from .models import CouvertureSol, CouvertureUsageMatrix, UsageSol


class DisplayMatrix(LoginRequiredMixin, BreadCrumbMixin, TemplateView):
    template_name = "public_data/us_cs_matrix.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {
                "href": reverse_lazy("public_data:matrix"),
                "title": "Matrice d'occupation",
            },
        )
        return breadcrumbs

    def get_context_data(self, **kwargs):
        couvertures = CouvertureSol.get_leafs()
        usages = UsageSol.get_leafs()
        qs = (
            CouvertureUsageMatrix.objects.filter(couverture__in=couvertures, usage__in=usages)
            .order_by("usage__code", "couverture__code")
            .select_related("usage", "couverture")
        )
        kwargs = dict()
        for item in qs:
            label = f"matrix_{item.usage.code}".replace(".", "_")
            if label not in kwargs:
                kwargs[label] = dict()
            kwargs[label][item.couverture.code] = item
        return super().get_context_data(**kwargs)


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


class OcsgeViewSet(OnlyBoundingBoxMixin, ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    queryset = models.Ocsge.objects.all()
    serializer_class = serializers.OcsgeSerializer
    optimized_fields = {
        "o.couverture": "code_couverture",
        "o.usage": "code_usage",
        "o.surface / 10000": "surface",
        "o.year": "year",
        "pdcs.label_short": "couverture_label_short",
        "pdus.label_short": "usage_label_short",
    }
    min_zoom = 12

    def get_queryset(self):
        """
        Optionally restricts the returned polygon to those of a specific year
        """
        qs = self.queryset
        year = self.request.query_params.get("year")
        if year:
            qs = qs.filter(year=year)
        return qs

    def get_sql_from(self):
        from_parts = [
            super().get_sql_from(),
            "INNER JOIN public_data_couverturesol pdcs ON o.couverture = pdcs.code_prefix",
            "INNER JOIN public_data_usagesol pdus ON o.usage = pdus.code_prefix",
        ]
        return " ".join(from_parts)

    def get_sql_where(self):
        where_members = ["o.year = %s"]
        if "is_artificial" in self.request.query_params:
            where_members.append("o.is_artificial = %s")
        return f'where {" and ".join(where_members)}'

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox")
        year = request.query_params.get("year")
        if bbox is None or year is None:
            raise ValueError(f"bbox and year parameter must be set. bbox={bbox};year={year}")
        params = list(map(float, bbox.split(",")))
        params.append(int(year))
        if "is_artificial" in self.request.query_params:
            params.append(bool(request.query_params.get("is_artificial")))
        return params  # /!\ order matter, see sql query below


class OcsgeDiffViewSet(ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    # TODO : replace subqueries below by frontend logic
    queryset = models.OcsgeDiff.objects.all()
    serializer_class = serializers.OcsgeDiffSerializer
    optimized_fields = {
        # "o.id": "id",
        "(SELECT code_prefix || ' ' || label_short FROM public_data_couverturesol AS pdcs WHERE pdcs.code_prefix = cs_old)": "cs_old",  # noqa: E501
        "(SELECT code_prefix || ' ' || label_short FROM public_data_usagesol AS pdus WHERE pdus.code_prefix = us_old)": "us_old",  # noqa: E501
        "(SELECT code_prefix || ' ' || label_short FROM public_data_couverturesol AS pdcs WHERE pdcs.code_prefix = cs_new)": "cs_new",  # noqa: E501
        "(SELECT code_prefix || ' ' || label_short FROM public_data_usagesol AS pdus WHERE pdus.code_prefix = us_new)": "us_new",  # noqa: E501
        "year_new": "year_new",
        "year_old": "year_old",
        "is_new_artif": "is_new_artif",
        "is_new_natural": "is_new_natural",
        "surface / 10000": "surface",
    }

    min_zoom = 15

    def get_zoom(self):
        try:
            return super().get_zoom()
        except ValueError:
            return 18  # make old map work

    def get_params(self, request):
        params = [int(request.query_params.get("year_new"))]
        params.append(int(request.query_params.get("year_old")))

        if "is_new_artif" in request.query_params:
            params.append(bool(request.query_params.get("is_new_artif")))
        if "is_new_natural" in request.query_params:
            params.append(bool(request.query_params.get("is_new_natural")))
        if "project_id" in request.query_params:
            params.append(request.query_params.get("project_id"))

        # /!\ order matter, check sql query to know
        return params

    def get_sql_from(self):
        return f"from {self.queryset.model._meta.db_table} o"

    def get_sql_where(self):
        and_group = ["year_new = %s", "year_old = %s"]
        or_group = []
        if "is_new_artif" in self.request.query_params:
            or_group.append("is_new_artif = %s")
        if "is_new_natural" in self.request.query_params:
            or_group.append("is_new_natural = %s")
        if or_group:
            and_group.append(f"({' or '.join(or_group)})")
        if "project_id" in self.request.query_params:
            and_group.append(
                "ST_Intersects(mpoly, (SELECT ST_Union(mpoly) FROM project_emprise WHERE project_id = %s))"
            )
        where = f"where {' and '.join(and_group)}"
        return where


class OcsgeDiffCentroidViewSet(OcsgeDiffViewSet):
    optimized_geo_field = "st_AsGeoJSON(St_Centroid(o.mpoly))"


class ArtificialAreaViewSet(OnlyBoundingBoxMixin, ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    queryset = models.ArtificialArea.objects.all()
    serializer_class = serializers.OcsgeDiffSerializer
    optimized_fields = {
        "o.id": "id",
        "c.name": "city",
        "o.surface": "surface",
        "o.year": "year",
    }
    optimized_geo_field = "st_AsGeoJSON(ST_Intersection(o.mpoly, b.box), 6, 0)"
    min_zoom = 12

    def get_zoom(self):
        try:
            return super().get_zoom()
        except ValueError:
            return 18  # make old map work

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox").split(",")
        params = list(map(float, bbox))
        if "project_id" in request.query_params:
            params.append(request.query_params.get("project_id"))
        params.append(int(request.query_params.get("year")))
        return params

    def get_sql_from(self):
        sql_from = [
            f"FROM {self.queryset.model._meta.db_table} o",
            f"INNER JOIN {models.Commune._meta.db_table} c ON o.city = c.insee",
            "INNER JOIN (SELECT ST_MakeEnvelope(%s, %s, %s, %s, 4326) as box) as b",
            "ON ST_Intersects(o.mpoly, b.box)",
        ]
        if "project_id" in self.request.query_params:
            sql_from += [
                "INNER JOIN (SELECT ST_Union(pe.mpoly) as geom FROM project_emprise pe WHERE project_id = %s) as t",
                "ON ST_Intersects(o.mpoly, t.geom)",
            ]
        return " ".join(sql_from)

    def get_sql_where(self):
        return "WHERE o.year = %s"


class ZoneUrbaViewSet(OnlyBoundingBoxMixin, ZoomSimplificationMixin, OptimizedMixins, DataViewSet):
    queryset = models.ZoneUrba.objects.all()
    serializer_class = serializers.ZoneUrbaSerializer
    optimized_fields = {
        "o.checksum": "id",
        "o.libelle": "libelle",
        "o.libelong": "libelong",
        "o.typezone": "typezone",
        "o.datappro": "datappro",
        "o.datvalid": "datvalid",
        "ST_AsEWKT((ST_MaximumInscribedCircle(o.mpoly)).center)": "label_center",
    }

    min_zoom = 10

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox").split(",")
        params = list(map(float, bbox))
        if "project_id" in request.query_params:
            params.append(request.query_params.get("project_id"))

        return params

    def get_sql_from(self):
        sql_from = [
            f"FROM {self.queryset.model._meta.db_table} o",
            "INNER JOIN (SELECT ST_MakeEnvelope(%s, %s, %s, %s, 4326) as box) as b",
            "ON ST_Intersects(o.mpoly, b.box)",
        ]
        if "project_id" in self.request.query_params:
            sql_from += [
                "INNER JOIN (SELECT ST_Union(mpoly) as geom FROM project_emprise WHERE project_id = %s) as t",
                "ON ST_Intersects(o.mpoly, t.geom)",
            ]
        return " ".join(sql_from)

    def get_sql_where(self):
        where_parts = ["St_IsValid(mpoly) = true"]
        if "type_zone" in self.request.query_params:
            zones = [_.strip() for _ in self.request.query_params.get("type_zone").split(",")]
            zones = [f"'{_}'" for _ in zones if _ in ["U", "A", "N", "AU"]]
            where_parts.append(f"o.typezone in ({', '.join(zones)})")
        return f"where {' and '.join(where_parts)}"


# Views for referentials Couverture and Usage


class UsageSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = models.UsageSol.objects.all()
    serializer_class = serializers.UsageSolSerializer


class CouvertureSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = models.CouvertureSol.objects.all()
    serializer_class = serializers.CouvertureSolSerializer


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
