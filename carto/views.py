from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from public_data.models import CouvertureSol


class VectorView(LoginRequiredMixin, TemplateView):
    template_name = "carto/vector.html"

    def get_context_data(self, **kwargs):
        kwargs["couv_sol_list"] = CouvertureSol.objects.all()
        return super().get_context_data(**kwargs)
