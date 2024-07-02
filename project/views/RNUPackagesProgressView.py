from django.db.models import F, IntegerField, Sum
from django.db.models.functions import Cast
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from project.models import Project
from public_data.models import Commune
from public_data.models.sudocuh import DocumentUrbanismeChoices, Sudocuh
from users.models import User


class RNUPackagesProgressView(APIView):
    def get(self, request):
        diagnostic_to_create = Sudocuh.objects.filter(du_opposable=DocumentUrbanismeChoices.RNU)
        of_those_with_ocsge = Commune.objects.filter(
            insee__in=diagnostic_to_create.values("code_insee"),
            ocsge_available=True,
        )
        of_those_with_ocsge_count = of_those_with_ocsge.count()
        diagnostic_to_create_count = diagnostic_to_create.count()
        mda_user = User.objects.get(email="rnu.package@mondiagartif.beta.gouv.fr")

        diagnostic_created = Project.objects.filter(
            user=mda_user,
        )
        diagnostic_created_count = diagnostic_created.count()

        async_fields = [
            "async_add_city_done",
            "async_set_combined_emprise_done",
            "async_cover_image_done",
            "async_find_first_and_last_ocsge_done",
            "async_add_comparison_lands_done",
            "async_ocsge_coverage_status_done",
        ]

        async_fields_with_ocsge = [
            "async_theme_map_understand_artif_done",
            "async_theme_map_gpu_done",
            "async_theme_map_fill_gpu_done",
        ]

        aggregate_results = []

        for field in async_fields:
            aggregate_results.append(
                diagnostic_created.aggregate(
                    **{
                        f"{field}_count": Sum(Cast(field, IntegerField())),
                        f"{field}_percentage": F(f"{field}_count") * 100.0 / diagnostic_to_create_count,
                    }
                )
            )
        for field in async_fields_with_ocsge:
            aggregate_results.append(
                diagnostic_created.aggregate(
                    **{
                        f"{field}_count": Sum(Cast(field, IntegerField())),
                        f"{field}_percentage": F(f"{field}_count") * 100.0 / of_those_with_ocsge_count,
                    }
                )
            )

        time_diff = timezone.now() - mda_user.date_joined
        hours = time_diff.seconds // 3600
        minutes = (time_diff.seconds % 3600) // 60
        seconds = time_diff.seconds % 60

        return Response(
            {
                "elapsed_time": f"{hours}h {minutes}m {seconds}s",
                "diagnostic_to_create_count": diagnostic_to_create_count,
                "of_those_with_ocsge_count": of_those_with_ocsge_count,
                "diagnostic_created_count": diagnostic_created_count,
                "diangostic_created_percentage": f"{diagnostic_created_count / diagnostic_to_create_count * 100}%",
                "async_operations_progress": aggregate_results,
            }
        )
