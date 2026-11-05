import json

from django.core.cache import cache
from django.db import connection
from django.db.models import Max, Min
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from public_data import serializers
from public_data.domain.national_map import (
    FORMAT_VERSION,
    LEVELS,
    SCALES,
    SCALES_REQUIRING_PARENT,
    build_base_map,
    is_finer_than_parent,
)
from public_data.domain.national_map_indicators import (
    BIVARIATES,
    CONSO_FIELDS,
    FIRST_YEAR,
    INDICATORS_FORMAT_VERSION,
    build_indicators,
    group_by_land,
    period_error,
)
from public_data.models.administration import (
    AdminRef,
    LandGeoJSON,
    LandModel,
    LandModelSearchSerializer,
)
from public_data.models.bivariate import (
    BivariateConsoThreshold,
    BivariateIndicThreshold,
    BivariateLandRate,
)
from public_data.models.consommation.LandConso import LandConso
from public_data.throttles import SearchLandApiThrottle


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

        results = LandModel.search(needle, search_for="*")
        output = LandModelSearchSerializer(results, many=True).data

        return Response(data=output)


class RapportCompletView(TemplateView):
    template_name = "public_data/rapport_complet.html"

    def get_context_data(self, **kwargs):
        kwargs.update(
            {
                "land_type": self.kwargs.get("land_type"),
                "land_id": self.kwargs.get("land_id"),
            }
        )
        return super().get_context_data(**kwargs)


class RapportDraftView(TemplateView):
    template_name = "public_data/rapport_draft.html"

    def get_context_data(self, **kwargs):
        kwargs.update(
            {
                "draft_id": self.kwargs.get("draft_id"),
            }
        )
        return super().get_context_data(**kwargs)


class PdfHeaderView(TemplateView):
    template_name = "public_data/pdf_header.html"


class PdfFooterView(TemplateView):
    template_name = "public_data/pdf_footer.html"


class NationalMapBaseMapView(APIView):
    """Fond de carte « France entière » de la carte nationale, par maille (région ou département).

    Les géométries viennent des GeoJSON précalculés par dbt pour la nation ; les
    régions d'outre-mer sont déplacées dans des cartouches autour de l'Hexagone.
    Le résultat ne change qu'au rafraîchissement des données : il est mis en cache.
    """

    CACHE_DURATION = 60 * 60 * 24
    NATION = "NATION"

    def get(self, request, format=None):
        scale = request.query_params.get("scale", "REGION")
        parent, error = _requested_parent(request)
        error = error or _check_scale(scale, parent)
        if error:
            return error

        base_map = cache.get_or_set(
            f"national-map:base-map:v{FORMAT_VERSION}:{scale}:{parent.key if parent else self.NATION}",
            lambda: self.build(scale, parent),
            self.CACHE_DURATION,
        )
        response = Response(base_map)
        response["Cache-Control"] = "public, max-age=3600"
        return response

    def build(self, scale, parent=None):
        lands = _lands(scale, parent).values_list("land_id", "has_conso", "parent_keys")
        has_conso = {}
        regions = {}
        for land_id, land_has_conso, parent_keys in lands:
            has_conso[land_id] = land_has_conso
            regions[land_id] = self.parent_region(parent_keys)
        base_map = build_base_map(self.geojson(scale, parent), scale, has_conso, regions)
        base_map["parent"] = _parent_description(parent) if parent is not None else None
        return base_map

    def geojson(self, scale, parent=None):
        """GeoJSON précalculé des territoires de la maille, pour la nation ou pour un parent.

        Il n'existe pas de GeoJSON national à la maille EPCI : on réunit ceux des régions,
        en ne gardant qu'une fois les EPCI à cheval sur deux régions.
        """
        if parent is not None:
            return LandGeoJSON.for_parent(parent.land_id, parent.land_type, scale)
        if scale != AdminRef.EPCI:
            return LandGeoJSON.for_parent(self.NATION, self.NATION, scale)
        features = {}
        for geojson in LandGeoJSON.objects.filter(land_type=AdminRef.REGION, child_land_type=scale).values_list(
            "geojson", flat=True
        ):
            for feature in geojson.get("features", []):
                features.setdefault(feature["properties"]["land_id"], feature)
        return {"type": "FeatureCollection", "features": list(features.values())}

    @staticmethod
    def parent_region(parent_keys):
        """Code de la région contenant le territoire, d'après ses clés de parents (``REGION_84``)."""
        prefix = f"{AdminRef.REGION}_"
        return next((key.removeprefix(prefix) for key in parent_keys or [] if key.startswith(prefix)), None)


def _requested_parent(request):
    """Territoire parent passé en paramètres (``parent_type``, ``parent_id``), ou None pour la nation.

    Renvoie ``(parent, error)`` : ``parent`` est un ``LandModel`` ou None, ``error`` une réponse à renvoyer.
    """
    parent_type = request.query_params.get("parent_type") or None
    parent_id = request.query_params.get("parent_id") or None
    if parent_type is None and parent_id is None:
        return None, None
    if parent_type not in LEVELS[1:-1] or not parent_id:
        return None, _invalid_parameter(
            f"parent_type doit valoir {', '.join(LEVELS[1:-1])} et parent_id être renseigné"
        )
    parent = LandModel.objects.filter(land_type=parent_type, land_id=parent_id).first()
    if parent is None:
        return None, Response({"detail": "Territoire parent inconnu"}, status=status.HTTP_404_NOT_FOUND)
    return parent, None


def _check_scale(scale, parent):
    """Réponse d'erreur si la maille n'est pas affichable pour ce parent, sinon None."""
    if scale not in SCALES:
        return _invalid_parameter(f"Paramètre scale invalide : valeurs acceptées {', '.join(SCALES)}")
    if parent is None and scale in SCALES_REQUIRING_PARENT:
        return _invalid_parameter(f"La maille {scale} n'est disponible que pour un territoire parent")
    if parent is not None and not is_finer_than_parent(parent.land_type, scale):
        return _invalid_parameter(f"La maille {scale} n'est pas plus fine que le parent {parent.land_type}")
    return None


def _lands(scale, parent=None):
    """Territoires d'une maille, de toute la France ou d'un territoire parent."""
    lands = LandModel.objects.filter(land_type=scale)
    if parent is not None:
        lands = lands.filter(parent_keys__contains=[parent.key])
    return lands


def _parent_description(parent):
    """Parent et ses ancêtres (région puis département), pour le fil d'Ariane."""
    keys = [key for key in parent.parent_keys or [] if key.split("_", 1)[0] in (AdminRef.REGION, AdminRef.DEPARTEMENT)]
    ancestors = LandModel.objects.filter(key__in=keys).values("land_type", "land_id", "name")
    order = {AdminRef.REGION: 0, AdminRef.DEPARTEMENT: 1}
    return {
        "land_type": parent.land_type,
        "land_id": parent.land_id,
        "name": parent.name,
        "ancestors": sorted(ancestors, key=lambda a: order.get(a["land_type"], 2)),
    }


def _invalid_parameter(detail):
    return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)


class NationalMapIndicatorsView(APIView):
    """Indicateurs de consommation d'ENAF de tous les territoires d'une maille, pour la carte nationale.

    Une seule réponse par maille et période : consommation sur la période demandée et
    sur les périodes de référence, ménages et emplois par hectare consommé, classes des
    cartes bivariées. Les données ne changent qu'au rafraîchissement dbt : mise en cache.
    """

    CACHE_DURATION = 60 * 60

    def get(self, request, format=None):
        scale = request.query_params.get("scale", "REGION")
        parent, error = _requested_parent(request)
        error = error or _check_scale(scale, parent)
        if error:
            return error

        years = cache.get_or_set(
            f"national-map:years:v{INDICATORS_FORMAT_VERSION}:{scale}",
            lambda: self.available_years(scale),
            self.CACHE_DURATION,
        )
        if years is None:
            return Response(
                {"detail": "Aucune donnée de consommation pour cette maille"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            start_year = int(request.query_params.get("start_year", FIRST_YEAR))
            end_year = int(request.query_params.get("end_year", years[1]))
        except ValueError:
            return _invalid_parameter("Les paramètres start_year et end_year doivent être des années entières")
        error = period_error(start_year, end_year, *years)
        if error:
            return _invalid_parameter(error)

        cache_key = (
            f"national-map:indicators:v{INDICATORS_FORMAT_VERSION}:{scale}"
            f":{parent.key if parent else 'NATION'}:{start_year}:{end_year}"
        )
        indicators = cache.get_or_set(
            cache_key,
            lambda: self.build(scale, (start_year, end_year), years, parent),
            self.CACHE_DURATION,
        )
        response = Response(indicators)
        response["Cache-Control"] = "public, max-age=600"
        return response

    def available_years(self, scale):
        """Première et dernière années de consommation de la maille, None sans données."""
        bounds = LandConso.objects.filter(land_type=scale).aggregate(Min("year"), Max("year"))
        if bounds["year__min"] is None:
            return None
        return (bounds["year__min"], bounds["year__max"])

    def build(self, scale, period, years, parent=None):
        surfaces = dict(_lands(scale, parent).values_list("land_id", "surface"))
        conso_rows = LandConso.objects.filter(land_type=scale)
        if parent is not None:
            conso_rows = conso_rows.filter(land_id__in=list(surfaces))
        conso = group_by_land(conso_rows.values("land_id", "year", *CONSO_FIELDS))
        rates, thresholds = self.bivariate_data(scale, period, list(surfaces) if parent is not None else None)
        return build_indicators(scale, period, years, surfaces, conso, rates, thresholds)

    @staticmethod
    def bivariate_data(scale, period, land_ids=None):
        """Taux par territoire et seuils des cartes bivariées pour la période, lus dans les tables dbt.

        Renvoie ``(rates, thresholds)`` : carte -> territoire -> (taux de conso, taux de l'indicateur),
        et carte -> (conso_t1, conso_t2, indic_t1, indic_t2) ou None si la période n'a pas de seuils.
        ``land_ids`` restreint les taux aux territoires d'un parent ; les seuils restent nationaux.
        """
        start_year, end_year = period
        filters = {"land_type": scale, "start_year": start_year, "end_year": end_year}
        indicators = [b.indicator for b in BIVARIATES.values()]
        conso_fields = [b.conso_field for b in BIVARIATES.values()]

        conso_thresholds = {
            conso_field: (t1, t2)
            for conso_field, t1, t2 in BivariateConsoThreshold.objects.filter(
                conso_field__in=conso_fields, **filters
            ).values_list("conso_field", "t1_max", "t2_max")
        }
        indic_thresholds = {
            indicator: (t1, t2)
            for indicator, t1, t2 in BivariateIndicThreshold.objects.filter(
                indicator__in=indicators, **filters
            ).values_list("indicator", "t1_max", "t2_max")
        }
        thresholds = {}
        for key, bivariate in BIVARIATES.items():
            if bivariate.conso_field in conso_thresholds and bivariate.indicator in indic_thresholds:
                thresholds[key] = (*conso_thresholds[bivariate.conso_field], *indic_thresholds[bivariate.indicator])
            else:
                thresholds[key] = None

        key_by_pair = {(b.indicator, b.conso_field): key for key, b in BIVARIATES.items()}
        rates = {key: {} for key in BIVARIATES}
        rows = BivariateLandRate.objects.filter(indicator__in=indicators, **filters)
        if land_ids is not None:
            rows = rows.filter(land_id__in=land_ids)
        rows = rows.values_list("indicator", "conso_field", "land_id", "conso_rate", "indic_rate")
        for indicator, conso_field, land_id, conso_rate, indic_rate in rows:
            key = key_by_pair.get((indicator, conso_field))
            if key:
                rates[key][land_id] = (conso_rate, indic_rate)
        return rates, thresholds
