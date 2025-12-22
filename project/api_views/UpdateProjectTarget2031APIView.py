import json
import logging

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from project.models import Project


@method_decorator(csrf_exempt, name="dispatch")
class UpdateProjectTarget2031APIView(View):
    """API view pour mettre à jour l'objectif de réduction target_2031 d'un projet."""

    def post(self, request, pk):
        try:
            project = get_object_or_404(Project, pk=pk)

            data = json.loads(request.body)
            target_2031 = data.get("target_2031")

            if target_2031 is None:
                return JsonResponse({"success": False, "error": "target_2031 est requis"}, status=400)

            try:
                target_value = float(target_2031)
                if not 0 <= target_value <= 100:
                    return JsonResponse(
                        {"success": False, "error": "target_2031 doit être entre 0 et 100"}, status=400
                    )
            except (ValueError, TypeError):
                return JsonResponse({"success": False, "error": "target_2031 doit être un nombre"}, status=400)

            project.target_2031 = target_value
            project.save()

            return JsonResponse({"success": True, "target_2031": float(project.target_2031)})

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur lors de la mise à jour de target_2031 pour le projet {pk}: {str(e)}", exc_info=True)
            return JsonResponse(
                {"success": False, "error": "Une erreur est survenue lors de la mise à jour"}, status=500
            )
