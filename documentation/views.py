from django.views.generic import TemplateView

from utils.views_mixins import BreadCrumbMixin


class FAQView(BreadCrumbMixin, TemplateView):
    template_name = "documentation/faq.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"title": "FAQ"},
        )
        return breadcrumbs


class TutorielView(BreadCrumbMixin, TemplateView):
    template_name = "documentation/tutoriel.html"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append(
            {"title": "Tutoriel"},
        )
        return breadcrumbs
