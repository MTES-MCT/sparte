import json
import logging

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from project.models.user_land_preference import UserLandPreference
from public_data.models import AdminRef

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class UserLandPreferenceAPIView(View):
    """GET: retourne les preferences de l'utilisateur pour un territoire."""

    def get(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)
        if not request.user or not request.user.is_authenticated:
            return JsonResponse({"is_favorited": False, "target_2031": None, "comparison_lands": []})

        try:
            pref = UserLandPreference.objects.get(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            return JsonResponse(
                {
                    "is_favorited": True,
                    "target_2031": float(pref.target_2031) if pref.target_2031 is not None else None,
                    "comparison_lands": pref.comparison_lands,
                }
            )
        except UserLandPreference.DoesNotExist:
            return JsonResponse({"is_favorited": False, "target_2031": None, "comparison_lands": []})


@method_decorator(csrf_exempt, name="dispatch")
class UpdatePreferenceTarget2031APIView(View):
    """POST: met a jour target_2031 pour l'utilisateur courant."""

    def post(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)
        if not request.user or not request.user.is_authenticated:
            return JsonResponse({"success": False, "error": "Authentification requise"}, status=401)

        try:
            data = json.loads(request.body)
            target_2031 = data.get("target_2031")

            if target_2031 is None:
                return JsonResponse({"success": False, "error": "target_2031 est requis"}, status=400)

            try:
                target_value = float(target_2031)
                if not 0 <= target_value <= 100:
                    return JsonResponse(
                        {"success": False, "error": "target_2031 doit etre entre 0 et 100"}, status=400
                    )
            except (ValueError, TypeError):
                return JsonResponse({"success": False, "error": "target_2031 doit etre un nombre"}, status=400)

            pref, _ = UserLandPreference.objects.get_or_create(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            pref.target_2031 = target_value
            pref.save(update_fields=["target_2031"])

            return JsonResponse({"success": True, "target_2031": float(pref.target_2031)})

        except Exception as e:
            logger.error(
                f"Erreur lors de la mise a jour de target_2031 pour {land_type}/{land_id}: {str(e)}", exc_info=True
            )
            return JsonResponse(
                {"success": False, "error": "Une erreur est survenue lors de la mise a jour"}, status=500
            )


@method_decorator(csrf_exempt, name="dispatch")
class UpdatePreferenceComparisonLandsAPIView(View):
    """POST: met a jour comparison_lands pour l'utilisateur courant."""

    def post(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)
        if not request.user or not request.user.is_authenticated:
            return JsonResponse({"success": False, "error": "Authentification requise"}, status=401)

        try:
            data = json.loads(request.body)
            comparison_lands = data.get("comparison_lands")

            if comparison_lands is None:
                return JsonResponse({"success": False, "error": "comparison_lands est requis"}, status=400)

            if not isinstance(comparison_lands, list):
                return JsonResponse({"success": False, "error": "comparison_lands doit etre une liste"}, status=400)

            for item in comparison_lands:
                if not isinstance(item, dict):
                    return JsonResponse(
                        {"success": False, "error": "Chaque territoire doit etre un objet"}, status=400
                    )
                if not all(k in item for k in ["land_type", "land_id", "name"]):
                    return JsonResponse(
                        {"success": False, "error": "Chaque territoire doit avoir land_type, land_id et name"},
                        status=400,
                    )

            pref, _ = UserLandPreference.objects.get_or_create(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            pref.comparison_lands = comparison_lands
            pref.save(update_fields=["comparison_lands"])

            return JsonResponse({"success": True, "comparison_lands": pref.comparison_lands})

        except Exception as e:
            logger.error(
                f"Erreur lors de la mise a jour de comparison_lands pour {land_type}/{land_id}: {str(e)}",
                exc_info=True,
            )
            return JsonResponse(
                {"success": False, "error": "Une erreur est survenue lors de la mise a jour"}, status=500
            )


class ToggleFavoriteAPIView(View):
    """POST: ajoute ou supprime un territoire des favoris de l'utilisateur."""

    def post(self, request, land_type, land_id):
        land_type = AdminRef.slug_to_code(land_type)
        if not request.user or not request.user.is_authenticated:
            return JsonResponse({"success": False, "error": "Authentification requise"}, status=401)

        try:
            pref = UserLandPreference.objects.get(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            pref.delete()
            return JsonResponse({"success": True, "is_favorited": False})
        except UserLandPreference.DoesNotExist:
            UserLandPreference.objects.create(
                user=request.user,
                land_type=land_type,
                land_id=land_id,
            )
            return JsonResponse({"success": True, "is_favorited": True})
