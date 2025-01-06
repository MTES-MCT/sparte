from django.views.generic import TemplateView

from utils.views_mixins import BreadCrumbMixin


class AccessView(BreadCrumbMixin, TemplateView):
    template_name = "home/accessibilite.html"
