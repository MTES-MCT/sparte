from django.views.generic import TemplateView

from utils.views import BreadCrumbMixin


class AccessView(BreadCrumbMixin, TemplateView):
    template_name = "home/accessibilite.html"
