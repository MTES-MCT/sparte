from django.urls import reverse_lazy
from django.views.generic import TemplateView, DetailView

from utils.views_mixins import BreadCrumbMixin, GetObjectMixin

from .models import FrequentlyAskedQuestion


class Home(BreadCrumbMixin, TemplateView):
    template_name = "home/home.html"


class LegalNotice(BreadCrumbMixin, TemplateView):
    template_name = "home/legal_notices.html"


class Privacy(BreadCrumbMixin, TemplateView):
    template_name = "home/privacy.html"


class FrequentlyAskedQuestionDetail(GetObjectMixin, BreadCrumbMixin, DetailView):
    template_name = "home/faq_detail.html"
    context_object_name = "faq"
    queryset = FrequentlyAskedQuestion.objects.all()

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        faq = self.get_object()
        breadcrumbs += [
            {"href": reverse_lazy("home:faq-detail"), "title": faq.menu_entry},
        ]
        return breadcrumbs
