import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from project.models.user_land_preference import UserLandPreference
from public_data.models import AdminRef

logger = logging.getLogger(__name__)


class UserLandPreferenceAPIView(APIView):
    """GET: retourne les preferences de l'utilisateur pour un territoire."""

    def get(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)
        is_main = bool(
            request.user
            and request.user.is_authenticated
            and request.user.main_land_type == land_type
            and request.user.main_land_id == land_id
        )

        if not request.user or not request.user.is_authenticated:
            return Response(
                {
                    "is_favorited": False,
                    "target_2031": None,
                    "comparison_lands": [],
                    "is_main": False,
                }
            )

        try:
            pref = UserLandPreference.objects.get(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            return Response(
                {
                    "is_favorited": True,
                    "target_2031": float(pref.target_2031) if pref.target_2031 is not None else None,
                    "comparison_lands": pref.comparison_lands,
                    "is_main": is_main,
                }
            )
        except UserLandPreference.DoesNotExist:
            return Response(
                {
                    "is_favorited": False,
                    "target_2031": None,
                    "comparison_lands": [],
                    "is_main": is_main,
                }
            )


class UpdatePreferenceTarget2031APIView(APIView):
    """POST: met a jour target_2031 pour l'utilisateur courant."""

    permission_classes = [IsAuthenticated]

    def post(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)
        target_2031 = request.data.get("target_2031")

        if target_2031 is None:
            return Response({"success": False, "error": "target_2031 est requis"}, status=400)

        try:
            target_value = float(target_2031)
            if not 0 <= target_value <= 100:
                return Response({"success": False, "error": "target_2031 doit etre entre 0 et 100"}, status=400)
        except (ValueError, TypeError):
            return Response({"success": False, "error": "target_2031 doit etre un nombre"}, status=400)

        pref, _ = UserLandPreference.objects.get_or_create(
            user=request.user,
            land_type=land_type,
            land_id=land_id,
        )
        pref.target_2031 = target_value
        pref.save(update_fields=["target_2031"])

        return Response({"success": True, "target_2031": float(pref.target_2031)})


class UpdatePreferenceComparisonLandsAPIView(APIView):
    """POST: met a jour comparison_lands pour l'utilisateur courant."""

    permission_classes = [IsAuthenticated]

    def post(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)
        comparison_lands = request.data.get("comparison_lands")

        if comparison_lands is None:
            return Response({"success": False, "error": "comparison_lands est requis"}, status=400)

        if not isinstance(comparison_lands, list):
            return Response({"success": False, "error": "comparison_lands doit etre une liste"}, status=400)

        sanitized_lands = []
        for item in comparison_lands:
            if not isinstance(item, dict):
                return Response({"success": False, "error": "Chaque territoire doit etre un objet"}, status=400)
            if not all(k in item for k in ["land_type", "land_id", "name"]):
                return Response(
                    {"success": False, "error": "Chaque territoire doit avoir land_type, land_id et name"},
                    status=400,
                )
            sanitized_lands.append(
                {
                    "land_type": str(item["land_type"]),
                    "land_id": str(item["land_id"]),
                    "name": str(item["name"]),
                }
            )

        pref, _ = UserLandPreference.objects.get_or_create(
            user=request.user,
            land_type=land_type,
            land_id=land_id,
        )
        pref.comparison_lands = sanitized_lands
        pref.save(update_fields=["comparison_lands"])

        return Response({"success": True, "comparison_lands": pref.comparison_lands})


class ToggleFavoriteAPIView(APIView):
    """POST: ajoute ou supprime un territoire des favoris de l'utilisateur."""

    permission_classes = [IsAuthenticated]

    def post(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)

        try:
            pref = UserLandPreference.objects.get(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            pref.delete()
            return Response({"success": True, "is_favorited": False})
        except UserLandPreference.DoesNotExist:
            UserLandPreference.objects.create(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            return Response({"success": True, "is_favorited": True})
