from django.conf import settings
from django.views.generic import DetailView

from public_data.models import AdminRef
from public_data.models.administration import LandModel


class DiagnosticBaseView(DetailView):
    context_object_name = "land"
    model = LandModel

    def get_object(self, queryset=None):
        land_type = AdminRef.slug_to_code(self.kwargs["land_type"])
        return LandModel.objects.get(
            land_type=land_type,
            land_id=self.kwargs["land_id"],
        )

    def get_context_data(self, **kwargs):
        kwargs.update({"HIGHCHART_SERVER": settings.HIGHCHART_SERVER})

        return super().get_context_data(**kwargs)
