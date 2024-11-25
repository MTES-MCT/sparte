from django.views.generic import TemplateView

from utils.views_mixins import BreadCrumbMixin


class LegalNoticeView(BreadCrumbMixin, TemplateView):
    template_name = "home/legal_notices.html"
