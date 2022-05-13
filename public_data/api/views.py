"""Public data API views."""
from decimal import Decimal
import json

from django.db import connection
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_gis import filters

from public_data.models import (
    Artificialisee2015to2018,
    Artificielle2018,
    Commune,
    # CommunesSybarval,
    CouvertureSol,
    Departement,
    # EnveloppeUrbaine2018,
    Epci,
    Ocsge,
    OcsgeDiff,
    Region,
    Renaturee2018to2015,
    # Sybarval,
    UsageSol,
    # Voirie2018,
    # ZonesBaties2018,
    ZoneConstruite,
)

from .serializers import (
    Artificialisee2015to2018Serializer,
    Artificielle2018Serializer,
    CommuneSerializer,
    # CommunesSybarvalSerializer,
    CouvertureSolSerializer,
    DepartementSerializer,
    # EnveloppeUrbaine2018Serializer,
    EpciSerializer,
    OcsgeSerializer,
    OcsgeDiffSerializer,
    RegionSerializer,
    Renaturee2018to2015Serializer,
    # SybarvalSerializer,
    UsageSolSerializer,
    # Voirie2018Serializer,
    # ZonesBaties2018Serializer,
    ZoneConstruiteSerializer,
)


def decimal2float(obj):
    if isinstance(obj, Decimal):
        return float(obj)


# OCSGE layers viewssets


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


class Artificialisee2015to2018ViewSet(DataViewSet):
    queryset = Artificialisee2015to2018.objects.all()
    serializer_class = Artificialisee2015to2018Serializer


class Artificielle2018ViewSet(DataViewSet):
    queryset = Artificielle2018.objects.all()
    serializer_class = Artificielle2018Serializer


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
            "SELECT "  # nosec - all parameters are safe
            "o.id, o.couverture_label, o.usage_label, t.map_color, o.surface, "
            "o.year, st_AsGeoJSON(o.mpoly, 8) AS geojson "
            f"FROM {Ocsge._meta.db_table} o "
            f"INNER JOIN {table_name} t ON t.code_prefix = o.{field} "
            "WHERE o. mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326) "
            "AND o.year = %s"
        )
        params = bbox + [year]
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return [
                {
                    name: row[i]
                    for i, name in enumerate(
                        [
                            "id",
                            "couverture_label",
                            "usage_label",
                            "map_color",
                            "surface",
                            "year",
                            "geojson",
                        ]
                    )
                }
                for row in cursor.fetchall()
            ]

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
                        "id": row["id"],
                        "Couverture": row["couverture_label"],
                        "Usage": row["usage_label"],
                        "Millésime": row["year"],
                        "map_color": row["map_color"],
                        "Surface": row["surface"],
                    },
                    "geometry": "-geometry-",
                },
                default=decimal2float,
            )
            feature = feature.replace('"-geometry-"', row["geojson"])
            features.append(feature)
        features = f" [{', '.join(features)}]"
        geojson = geojson.replace('"-features-"', features)
        # return Response(geojson)
        return HttpResponse(geojson, content_type="application/json")


class Renaturee2018to2015ViewSet(DataViewSet):
    queryset = Renaturee2018to2015.objects.all()
    serializer_class = Renaturee2018to2015Serializer


class OcsgeDiffViewSet(DataViewSet):
    queryset = OcsgeDiff.objects.all()
    serializer_class = OcsgeDiffSerializer

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox").split(",")
        bbox = list(map(float, bbox))
        year_old = int(request.query_params.get("year_old"))
        year_new = int(request.query_params.get("year_new"))
        is_new_artif = bool(request.query_params.get("is_new_artif", False))
        is_new_natural = bool(request.query_params.get("is_new_natural", False))
        # /!\ order matter, see sql query below
        return [year_new, year_old] + bbox + [is_new_artif, is_new_natural]

    def get_data(self, request):
        query = (
            "select "
            "    id, year_old, year_new, "
            "    CONCAT(cs_old, ' ', cs_old_label), "
            "    CONCAT(us_old, ' ', us_old_label), "
            "    CONCAT(cs_new, ' ', cs_new_label), "
            "    CONCAT(us_new, ' ', us_new_label), "
            "    is_new_artif, is_new_natural, "
            "    st_AsGeoJSON(mpoly, 8) "
            f"from {OcsgeDiff._meta.db_table} "
            "where year_new = %s and year_old = %s "
            "    and mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326) "
            "    and is_new_artif = %s "
            "    and is_new_natural = %s "
        )
        params = self.get_params(request)
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return [
                {
                    name: row[i]
                    for i, name in enumerate(
                        [
                            "id",
                            "year_old",
                            "year_new",
                            "cs_old",
                            "us_old",
                            "cs_new",
                            "us_new",
                            "is_new_artif",
                            "is_new_natural",
                            "geojson",
                        ]
                    )
                }
                for row in cursor.fetchall()
            ]

    @action(detail=False)
    def optimized(self, request):
        geojson = json.dumps(
            {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "features": "-features-",
            }
        )
        features = []
        for row in self.get_data(request):
            feature = json.dumps(
                {
                    "type": "Feature",
                    "properties": {
                        "id": row["id"],
                        "Ancienne année": row["year_old"],
                        "Nouvelle année": row["year_new"],
                        "Ancienne couverture": row["cs_old"],
                        "Nouvelle couverture": row["cs_new"],
                        "Ancien usage": row["us_old"],
                        "Nouveau usage": row["us_new"],
                        "Artificialisation": "oui" if row["is_new_artif"] else "non",
                        "Renaturation": "oui" if row["is_new_natural"] else "non",
                    },
                    "geometry": "-geometry-",
                }
            )
            feature = feature.replace('"-geometry-"', row["geojson"])
            features.append(feature)
        features = f" [{', '.join(features)}]"
        geojson = geojson.replace('"-features-"', features)
        return HttpResponse(geojson, content_type="application/json")


class ZoneConstruiteViewSet(DataViewSet):
    queryset = ZoneConstruite.objects.all()
    serializer_class = ZoneConstruiteSerializer

    def get_params(self, request):
        bbox = request.query_params.get("in_bbox").split(",")
        bbox = list(map(float, bbox))
        year = int(request.query_params.get("year"))
        return [year] + bbox  # /!\ order matter, see sql query below

    def get_data(self, request):
        query = (
            "select id, id_source, year, millesime, surface, st_AsGeoJSON(mpoly, 8) "
            f"from {ZoneConstruite._meta.db_table} "
            "where year = %s and mpoly && ST_MakeEnvelope(%s, %s, %s, %s, 4326) "
        )
        params = self.get_params(request)
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return [
                {
                    name: row[i]
                    for i, name in enumerate(
                        [
                            "id",
                            "id_source",
                            "year",
                            "millesime",
                            "surface",
                            "geojson",
                        ]
                    )
                }
                for row in cursor.fetchall()
            ]

    @action(detail=False)
    def optimized(self, request):
        geojson = json.dumps(
            {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "features": "-features-",
            }
        )
        features = []
        for row in self.get_data(request):
            try:
                surface = int(row["surface"] * 100) / 100
            except TypeError:
                surface = 0
            feature = json.dumps(
                {
                    "type": "Feature",
                    "properties": {
                        "Année": row["year"],
                        "Surface": surface,
                    },
                    "geometry": "-geometry-",
                }
            )
            feature = feature.replace('"-geometry-"', row["geojson"])
            features.append(feature)
        features = f" [{', '.join(features)}]"
        geojson = geojson.replace('"-features-"', features)
        return HttpResponse(geojson, content_type="application/json")


# Views for referentials Couverture and Usage


class UsageSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = UsageSol.objects.all()
    serializer_class = UsageSolSerializer


class CouvertureSolViewset(viewsets.ReadOnlyModelViewSet):
    queryset = CouvertureSol.objects.all()
    serializer_class = CouvertureSolSerializer


# Views for french adminisitrative territories


class RegionViewSet(DataViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    geo_field = "mpoly"


class DepartementViewSet(DataViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    geo_field = "mpoly"


class EpciViewSet(DataViewSet):
    """EPCI view set."""

    queryset = Epci.objects.all()
    serializer_class = EpciSerializer
    geo_field = "mpoly"


class CommuneViewSet(DataViewSet):
    """Commune view set."""

    queryset = Commune.objects.all()
    serializer_class = CommuneSerializer
