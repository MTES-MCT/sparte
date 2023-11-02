from django.views.generic import TemplateView

from utils.views_mixins import BreadCrumbMixin

class FAQView(BreadCrumbMixin, TemplateView):
    template_name = "documentation/faq.html"
