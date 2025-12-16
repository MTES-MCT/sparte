import json
import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from project.models import Project


@method_decorator(csrf_exempt, name="dispatch")
class UpdateProjectComparisonLandsAPIView(View):
    """
    API view pour mettre à jour les territoires de comparaison d'un projet.
    Format attendu: [{land_type, land_id, name}, ...]
    """

    def post(self, request, pk):
        try:
            project = get_object_or_404(Project, pk=pk)

            data = json.loads(request.body)
            comparison_lands = data.get("comparison_lands")

            if comparison_lands is None:
                return JsonResponse({"success": False, "error": "comparison_lands est requis"}, status=400)

            if not isinstance(comparison_lands, list):
                return JsonResponse({"success": False, "error": "comparison_lands doit être une liste"}, status=400)

            # Valider le format de chaque territoire
            for item in comparison_lands:
                if not isinstance(item, dict):
                    return JsonResponse(
                        {"success": False, "error": "Chaque territoire doit être un objet"}, status=400
                    )
                if not all(k in item for k in ["land_type", "land_id", "name"]):
                    return JsonResponse(
                        {"success": False, "error": "Chaque territoire doit avoir land_type, land_id et name"},
                        status=400,
                    )

            project.comparison_lands = comparison_lands
            project.save(update_fields=["comparison_lands"])

            return JsonResponse({"success": True, "comparison_lands": project.comparison_lands})

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(
                f"Erreur lors de la mise à jour de comparison_lands pour le projet {pk}: {str(e)}", exc_info=True
            )
            return JsonResponse(
                {"success": False, "error": "Une erreur est survenue lors de la mise à jour"}, status=500
            )
