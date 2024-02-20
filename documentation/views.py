from django.views.generic import TemplateView
from django_app_parameter import app_parameter

from utils.views_mixins import BreadCrumbMixin


class FAQView(BreadCrumbMixin, TemplateView):
    template_name = "documentation/faq.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"title": "FAQ"},
        )
        return breadcrumbs

    def get_context_data(self, **kwargs):
        kwargs["team_email"] = app_parameter.TEAM_EMAIL
        return super().get_context_data(**kwargs)


class TutorielView(BreadCrumbMixin, TemplateView):
    template_name = "documentation/tutoriel.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"title": "Tutoriel"},
        )
        return breadcrumbs
