import gzip
import json

from django.contrib.postgres.aggregates import BoolOr
from django.core.cache import cache
from django.db import connection
from django.db.models import FloatField, Max, Min, Q, Sum
from django.db.models.functions import Coalesce, Floor
from django.http import HttpResponse
from django.middleware.gzip import re_accepts_gzip
from django.utils.cache import patch_vary_headers
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
    ancestor_ids,
    build_base_map,
    is_finer_than_parent,
    reference_placement,
)
from public_data.domain.national_map_artif import (
    ARTIF_FORMAT_VERSION,
    build_artif_indicators,
    group_flux_by_land,
)
from public_data.domain.national_map_indicators import (
    BIVARIATE_RATE_COLUMNS,
    BIVARIATES,
    CONSO_FIELDS,
    FIRST_YEAR,
    INDICATORS_FORMAT_VERSION,
    build_indicators,
    cross_bivariate_rates,
    fixed_periods,
    group_by_land,
    period_error,
    rates_from_columns,
)
from public_data.domain.national_map_values import (
    BIVARIATE,
    CONSO,
    FAMILY_BY_KEY,
    VALUES_FORMAT_VERSION,
    VALUES_SCALES,
    artif_columns,
    artif_content,
    bivariate_content,
    build_referential,
    build_values,
    compressed_body,
    conso_columns,
    conso_periods,
    needed_sums,
    request_error,
    requested_keys,
    scalar_content,
    sums_in_year_order,
    uses_period,
)
from public_data.models.administration import (
    AdminRef,
    LandGeoJSON,
    LandModel,
    LandModelSearchSerializer,
    NationalMapGeoJSON,
)
from public_data.models.artificialisation.flux.LandArtifFlux import LandArtifFlux
from public_data.models.bivariate import (
    BivariateConsoThreshold,
    BivariateIndicThreshold,
    BivariateLandRate,
    NationalMapBivariateRate,
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
        base_map = build_base_map(
            self.geojson(scale, parent), scale, has_conso, regions, self.placement(scale, parent)
        )
        base_map["parent"] = _parent_description(parent) if parent is not None else None
        return base_map

    def placement(self, scale, parent=None):
        """Placement des DROM à appliquer au fond, ou None pour le calculer sur ses propres entités.

        Les fonds nationaux partagent le placement du fond par région : l'Hexagone et les cartouches
        restent à la même place quand on change de maille. Le fond par région est lui-même la
        référence, et le fond d'un territoire parent n'est cadré que sur ses entités.
        """
        if parent is not None or scale == AdminRef.REGION:
            return None
        return reference_placement(self.geojson(AdminRef.REGION))

    def geojson(self, scale, parent=None):
        """GeoJSON précalculé des territoires de la maille, pour la nation ou pour un parent.

        Le fond allégé de la carte nationale est utilisé dès qu'il existe. Sinon on se rabat
        sur les GeoJSON des diagnostics, qui n'ont pas la nation à la maille EPCI : on réunit
        alors ceux des régions, en ne gardant qu'une fois les EPCI à cheval sur deux régions.
        """
        light = NationalMapGeoJSON.for_parent(
            parent.land_id if parent is not None else self.NATION,
            parent.land_type if parent is not None else self.NATION,
            scale,
        )
        if light is not None:
            return light
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
        """Code de la région contenant le territoire, d'après ses clés de parents (``REGION_84``).

        La liste peut contenir des valeurs nulles : une commune sans EPCI (île de Sein, Ouessant,
        île d'Yeu, Bréhat) ou sans SCoT a une clé absente à cet emplacement.
        """
        prefix = f"{AdminRef.REGION}_"
        return next((key.removeprefix(prefix) for key in parent_keys or [] if key and key.startswith(prefix)), None)


# Colonnes du parent utilisées par les vues de la carte nationale. Le reste de la ligne n'est pas
# chargé : les géométries d'une région pèsent plusieurs Mo, lus à chaque requête (jusqu'à 0,2 s).
PARENT_FIELDS = ("land_id", "land_type", "key", "name", "parent_keys")


def _requested_parent(request):
    """Territoire parent passé en paramètres (``parent_type``, ``parent_id``), ou None pour la nation.

    Renvoie ``(parent, error)`` : ``parent`` est un ``LandModel`` limité à ``PARENT_FIELDS`` ou None,
    ``error`` une réponse à renvoyer.
    """
    parent_type = request.query_params.get("parent_type") or None
    parent_id = request.query_params.get("parent_id") or None
    if parent_type is None and parent_id is None:
        return None, None
    if parent_type not in LEVELS[1:-1] or not parent_id:
        return None, _invalid_parameter(
            f"parent_type doit valoir {', '.join(LEVELS[1:-1])} et parent_id être renseigné"
        )
    parent = LandModel.objects.filter(land_type=parent_type, land_id=parent_id).only(*PARENT_FIELDS).first()
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
    """Parent et ses ancêtres, pour le fil d'Ariane.

    ``ancestors`` : la région, puis les départements par code croissant (un EPCI peut être à
    cheval sur plusieurs départements). L'ordre ne dépend que des codes, pas de celui des lignes
    de la table, qui change à chaque copie des données.
    """
    # Recherche par type et identifiant, qui sont indexés : la colonne key ne l'est pas, et
    # chercher les ancêtres par leur clé parcourait toute la table
    is_ancestor = Q()
    for land_type, land_id in ancestor_ids(parent.parent_keys):
        is_ancestor |= Q(land_type=land_type, land_id=land_id)
    ancestors = []
    if is_ancestor:
        ancestors = LandModel.objects.filter(is_ancestor).values("land_type", "land_id", "name")
    order = {AdminRef.REGION: 0, AdminRef.DEPARTEMENT: 1}
    return {
        "land_type": parent.land_type,
        "land_id": parent.land_id,
        "name": parent.name,
        "ancestors": sorted(ancestors, key=lambda a: (order.get(a["land_type"], 2), a["land_id"])),
    }


def _invalid_parameter(detail):
    return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)


def _conso_years(scale):
    """Première et dernière années de consommation de la maille, mises en cache.

    Renvoie ``(years, error)`` : ``years`` vaut None, et ``error`` est la réponse à renvoyer,
    quand la maille n'a aucune donnée de consommation.
    """
    years = cache.get_or_set(
        f"national-map:years:v{INDICATORS_FORMAT_VERSION}:{scale}",
        lambda: NationalMapIndicatorsView().available_years(scale),
        NationalMapIndicatorsView.CACHE_DURATION,
    )
    if years is None:
        return None, Response(
            {"detail": "Aucune donnée de consommation pour cette maille"}, status=status.HTTP_404_NOT_FOUND
        )
    return years, None


def _requested_period(request, years):
    """Période passée en paramètres (``start_year``, ``end_year``), par défaut toutes les années disponibles.

    Renvoie ``(period, error)`` : ``error`` est la réponse à renvoyer si la période n'est pas valide.
    """
    try:
        start_year = int(request.query_params.get("start_year", FIRST_YEAR))
        end_year = int(request.query_params.get("end_year", years[1]))
    except ValueError:
        return None, _invalid_parameter("Les paramètres start_year et end_year doivent être des années entières")
    error = period_error(start_year, end_year, *years)
    if error:
        return None, _invalid_parameter(error)
    return (start_year, end_year), None


class NationalMapIndicatorsView(APIView):
    """Indicateurs de consommation d'ENAF de tous les territoires d'une maille, pour la carte nationale.

    Une seule réponse par maille et période : consommation sur la période demandée, évolution
    entre les périodes de référence, classes des cartes bivariées. Les données ne changent qu'au
    rafraîchissement dbt : mise en cache.
    """

    CACHE_DURATION = 60 * 60

    def get(self, request, format=None):
        scale = request.query_params.get("scale", "REGION")
        parent, error = _requested_parent(request)
        error = error or _check_scale(scale, parent)
        if error:
            return error

        years, error = _conso_years(scale)
        if error:
            return error
        period, error = _requested_period(request, years)
        if error:
            return error

        cache_key = (
            f"national-map:indicators:v{INDICATORS_FORMAT_VERSION}:{scale}"
            f":{parent.key if parent else 'NATION'}:{period[0]}:{period[1]}"
        )
        indicators = cache.get_or_set(
            cache_key,
            lambda: self.build(scale, period, years, parent),
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
        conso = group_by_land(conso_rows.values_list("land_id", "year", *CONSO_FIELDS))
        # Seule la maille commune est trop grande pour lire en entier les taux d'une période. Aux
        # autres mailles (1 255 EPCI au plus), restreindre la lecture au parent ferait choisir à
        # PostgreSQL une recherche territoire par territoire dans la table d'origine (jusqu'à 6 s
        # pour les EPCI d'une région) : on lit toute la maille, build_indicators ne gardant que
        # les territoires de ``surfaces``.
        rates_parent = parent if scale in SCALES_REQUIRING_PARENT else None
        rates = self.bivariate_rates(scale, period, rates_parent, list(surfaces))
        thresholds = self.bivariate_thresholds(scale, period)
        return build_indicators(scale, period, years, surfaces, conso, rates, thresholds)

    @staticmethod
    def bivariate_thresholds(scale, period):
        """Seuils nationaux des cartes bivariées pour la période, lus dans les tables dbt.

        Carte -> (conso_t1, conso_t2, indic_t1, indic_t2), ou None si la période n'a pas de seuils.
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
        return thresholds

    @staticmethod
    def bivariate_rates(scale, period, parent=None, land_ids=None):
        """Taux des cartes bivariées pour la période : carte -> territoire -> (taux de conso, taux de l'indicateur).

        Sans ``parent``, toute la maille est lue. Avec un parent, seuls les taux de ses territoires
        le sont ; ``land_ids`` en donne alors les identifiants.
        """
        rows = NationalMapBivariateRate.rows_for_period(
            scale, period, BIVARIATE_RATE_COLUMNS, land_ids if parent is not None else None
        )
        if rows is not None:
            return rates_from_columns(rows)

        # Repli tant que le DAG update_app n'a pas copié la table compacte : mêmes taux, lus dans
        # la table d'origine (une ligne par indicateur, dispersées dans toute la table)
        start_year, end_year = period
        rows = BivariateLandRate.objects.filter(
            indicator__in=[b.indicator for b in BIVARIATES.values()],
            land_type=scale,
            start_year=start_year,
            end_year=end_year,
        )
        if parent is not None:
            # Sous-requête plutôt que liste d'identifiants : cette table a un index par territoire et,
            # avec des milliers de communes en liste, PostgreSQL la parcourt territoire par territoire
            # (plusieurs dizaines de secondes)
            rows = rows.filter(land_id__in=_lands(scale, parent).values("land_id"))
        return cross_bivariate_rates(
            rows.values_list("indicator", "conso_field", "land_id", "conso_rate", "indic_rate")
        )


class NationalMapArtifIndicatorsView(APIView):
    """Indicateurs d'artificialisation (OCS GE) de tous les territoires d'une maille, pour la carte nationale.

    Stock au dernier millésime de chaque territoire et flux entre ses deux derniers millésimes.
    Aucune période à choisir : les millésimes sont ceux de l'OCS GE, différents d'un département
    à l'autre. Les données ne changent qu'au rafraîchissement dbt : mise en cache.
    """

    CACHE_DURATION = 60 * 60
    LAND_FIELDS = ("land_id", "surface", "has_ocsge", "surface_artif", "percent_artif", "years_artif", "millesimes")
    FLUX_FIELDS = (
        "land_id",
        "year_old",
        "year_new",
        "millesime_old_index",
        "millesime_new_index",
        "flux_artif",
        "flux_desartif",
        "flux_artif_net",
    )

    def get(self, request, format=None):
        scale = request.query_params.get("scale", "REGION")
        parent, error = _requested_parent(request)
        error = error or _check_scale(scale, parent)
        if error:
            return error

        indicators = cache.get_or_set(
            f"national-map:artif-indicators:v{ARTIF_FORMAT_VERSION}:{scale}:{parent.key if parent else 'NATION'}",
            lambda: self.build(scale, parent),
            self.CACHE_DURATION,
        )
        response = Response(indicators)
        response["Cache-Control"] = "public, max-age=600"
        return response

    def build(self, scale, parent=None):
        lands = list(_lands(scale, parent).values(*self.LAND_FIELDS))
        flux_rows = LandArtifFlux.objects.filter(land_type=scale)
        if parent is not None:
            # Sous-requête plutôt que liste d'identifiants, comme pour les indicateurs de consommation
            flux_rows = flux_rows.filter(land_id__in=_lands(scale, parent).values("land_id"))
        return build_artif_indicators(scale, lands, group_flux_by_land(flux_rows.values(*self.FLUX_FIELDS)))


class NationalMapValuesView(APIView):
    """Valeurs d'un indicateur pour toutes les communes de France, en colonnes alignées.

    La carte nationale par commune colore 34 875 territoires dessinés par des tuiles : il ne lui
    faut qu'une valeur par commune, pas tous les indicateurs de chacune. La réponse donne les
    identifiants triés, la région de chaque commune, la colonne de la clé demandée (``key``) et,
    sur demande, celle des hectares affichés au survol (``amount``).

    Les valeurs sont celles des réponses « indicateurs » et « indicateurs d'artificialisation ».
    La réponse finale est mise en cache déjà compressée, et renvoyée telle quelle.
    """

    REFERENTIAL_DURATION = 60 * 60 * 24
    # Durée de vie d'un corps en cache. Une clé sans période ne change qu'au rafraîchissement des
    # données. Avec une période, 105 périodes sont possibles pour chacune des clés : hors périodes
    # de référence, que la carte propose toutes prêtes et dont la période par défaut fait partie,
    # une durée courte borne la mémoire occupée (un corps pèse 100 à 260 Ko).
    DURATION_WITHOUT_PERIOD = 60 * 60 * 24
    DURATION_REFERENCE_PERIOD = 60 * 60
    DURATION_OTHER_PERIOD = 60 * 10
    # Les colonnes servies sont calculées par les règles des indicateurs de consommation et
    # d'artificialisation : la version des clés de cache suit aussi les leurs.
    CACHE_VERSION = f"{VALUES_FORMAT_VERSION}.{INDICATORS_FORMAT_VERSION}.{ARTIF_FORMAT_VERSION}"

    def get(self, request, format=None):
        scale = request.query_params.get("scale", VALUES_SCALES[0])
        key = request.query_params.get("key")
        amount = request.query_params.get("amount") or None
        if scale not in VALUES_SCALES:
            return _invalid_parameter(f"Paramètre scale invalide : valeurs acceptées {', '.join(VALUES_SCALES)}")
        if request.query_params.get("parent_type") or request.query_params.get("parent_id"):
            return _invalid_parameter("Les valeurs ne sont servies que pour la France entière, sans territoire parent")
        error = request_error(key, amount)
        if error:
            return _invalid_parameter(error)

        years = period = None
        if FAMILY_BY_KEY[key] in (CONSO, BIVARIATE):
            years, error = _conso_years(scale)
            if error:
                return error
        if uses_period(key, amount):
            period, error = _requested_period(request, years)
            if error:
                return error

        cache_key = (
            f"national-map:values:v{self.CACHE_VERSION}:{scale}:{key}:{amount or '-'}"
            f":{'-'.join(map(str, period)) if period else 'sans-periode'}"
        )
        body = cache.get(cache_key)
        if body is None:
            body = compressed_body(self.build(scale, key, amount, period, years))
            cache.set(cache_key, body, self.body_duration(period, years))
        response = _gzipped_json_response(request, body)
        response["Cache-Control"] = "public, max-age=600"
        return response

    def body_duration(self, period, years):
        if period is None:
            return self.DURATION_WITHOUT_PERIOD
        is_reference = period in fixed_periods(years[1]).values()
        return self.DURATION_REFERENCE_PERIOD if is_reference else self.DURATION_OTHER_PERIOD

    def build(self, scale, key, amount, period, years):
        """Réponse (avant sérialisation) ; ``period`` et ``years`` valent None pour une clé qui n'en dépend pas."""
        referential = self.referential(scale)
        family = FAMILY_BY_KEY[key]
        if family == BIVARIATE:
            content = bivariate_content(
                key,
                referential,
                NationalMapIndicatorsView.bivariate_rates(scale, period)[key],
                NationalMapIndicatorsView.bivariate_thresholds(scale, period)[key],
            )
        elif family == CONSO:
            keys = requested_keys(key, amount)
            periods = conso_periods(period, years[1])
            sums = self.conso_sums(scale, needed_sums(keys), periods)
            content = scalar_content(key, amount, conso_columns(keys, referential, sums, periods))
        else:
            content = artif_content(key, amount, self.artif_columns(scale, referential))
        return build_values(scale, key, amount, period, referential, content)

    def referential(self, scale):
        """Territoires de la maille (identifiants triés, régions, surfaces, données disponibles), en cache.

        C'est la lecture la plus longue d'une réponse de consommation (0,3 s), et elle ne change
        qu'au rafraîchissement des données.
        """
        return cache.get_or_set(
            f"national-map:values:referential:v{self.CACHE_VERSION}:{scale}",
            lambda: build_referential(
                (land_id, name, surface, has_conso, has_ocsge, NationalMapBaseMapView.parent_region(parent_keys))
                for land_id, name, surface, has_conso, has_ocsge, parent_keys in _lands(scale).values_list(
                    "land_id", "name", "surface", "has_conso", "has_ocsge", "parent_keys"
                )
            ),
            self.REFERENTIAL_DURATION,
        )

    def artif_columns(self, scale, referential):
        """Colonnes de toutes les clés d'artificialisation, en cache.

        Elles viennent d'une seule lecture, d'environ une seconde : la première clé demandée la
        paie, les autres en sont tirées.
        """
        return cache.get_or_set(
            f"national-map:values:artif:v{self.CACHE_VERSION}:{scale}",
            lambda: artif_columns(referential, NationalMapArtifIndicatorsView().build(scale)["lands"]),
            self.REFERENTIAL_DURATION,
        )

    @staticmethod
    def conso_sums(scale, sums, periods):
        """Sommes de consommation en m², par territoire : territoire -> une valeur par somme de ``sums``.

        ``sums`` : sommes à lire (``ConsoSum``) ; ``periods`` : leurs périodes nommées. Une somme
        vaut None si le territoire n'a aucun millésime dans sa période, et un territoire sans
        millésime dans aucune période est absent.

        Les sommes sont faites par la base : relire les millésimes de toutes les communes pour les
        additionner ici prendrait quatre fois plus de temps sur la période entière (0,6 s contre
        0,16 s, mesuré). Elles doivent pourtant être identiques, au bit près, à celles de la réponse
        « indicateurs », qui additionne les millésimes un à un : c'est acquis quand tous les termes
        sont des nombres entiers de m², l'addition étant alors exacte quel que soit son ordre. Les
        rares territoires dont une consommation n'est pas entière (160 millésimes sur 488 250 en
        novembre 2026) sont relus et additionnés comme le fait « indicateurs ».
        """
        first_year = min(periods[conso_sum.period][0] for conso_sum in sums)
        last_year = max(periods[conso_sum.period][1] for conso_sum in sums)
        rows = LandConso.objects.filter(land_type=scale, year__gte=first_year, year__lte=last_year)
        is_fractional = Q()
        for field in {conso_sum.field for conso_sum in sums}:
            is_fractional |= Q(**{f"{field}__gt": Floor(field)})
        aggregates = {}
        for position, (field, period_name) in enumerate(sums):
            start_year, end_year = periods[period_name]
            # Une consommation non renseignée compte pour zéro, comme dans period_sum
            aggregates[f"sum_{position}"] = Sum(
                Coalesce(field, 0.0, output_field=FloatField()), filter=Q(year__gte=start_year, year__lte=end_year)
            )

        sums_by_land = {}
        fractional = []
        for land_id, has_fraction, *values in (
            rows.values("land_id")
            .annotate(has_fraction=BoolOr(is_fractional), **aggregates)
            .values_list("land_id", "has_fraction", *aggregates)
        ):
            sums_by_land[land_id] = values
            if has_fraction:
                fractional.append(land_id)
        if fractional:
            vintages = group_by_land(rows.filter(land_id__in=fractional).values_list("land_id", "year", *CONSO_FIELDS))
            for land_id, conso_by_year in vintages.items():
                sums_by_land[land_id] = sums_in_year_order(conso_by_year, sums, periods)
        return sums_by_land


def _gzipped_json_response(request, body):
    """Réponse JSON à partir d'un corps déjà compressé en gzip.

    Le corps est renvoyé tel quel à un client qui accepte gzip (même règle que ``GZipMiddleware``,
    qui laisse passer une réponse déjà encodée), et décompressé pour les autres.
    """
    if re_accepts_gzip.search(request.META.get("HTTP_ACCEPT_ENCODING", "")):
        response = HttpResponse(body, content_type="application/json")
        response["Content-Encoding"] = "gzip"
    else:
        response = HttpResponse(gzip.decompress(body), content_type="application/json")
    patch_vary_headers(response, ("Accept-Encoding",))
    return response
