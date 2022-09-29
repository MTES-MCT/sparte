from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin


class VectorView(LoginRequiredMixin, TemplateView):
    template_name = "carto/vector.html"
