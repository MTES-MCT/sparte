from django.urls import reverse_lazy
from django.views.generic import TemplateView, DetailView

from django_app_parameter import app_parameter

from project.models import Request
from utils.views_mixins import BreadCrumbMixin, GetObjectMixin

from . import charts
from .models import FrequentlyAskedQuestion


class Home(BreadCrumbMixin, TemplateView):
    template_name = "home/home.html"


class LegalNotice(BreadCrumbMixin, TemplateView):
    template_name = "home/legal_notices.html"


class Privacy(BreadCrumbMixin, TemplateView):
    template_name = "home/privacy.html"


class Stats(BreadCrumbMixin, TemplateView):
    template_name = "home/stats.html"

    def get_context_data(self, **kwargs):
        kwargs = dict()
        kwargs["nb_dl_portrait"] = Request.objects.all().count() + 1
        kwargs["budget"] = app_parameter.BUDGET_CONSOMME
        kwargs["cout_portrait"] = int(
            round(kwargs["budget"] / kwargs["nb_dl_portrait"], 0)
        )
        kwargs["diag_created_downloaded"] = charts.DiagAndDownloadChart()
        kwargs["report_pie"] = charts.UseOfReportPieChart()
        kwargs["date_budget"] = app_parameter.BUDGET_DATE
        kwargs["organism_pie_chart"] = charts.OrganismPieChart()
        # kwargs["function_pie_chart"] = charts.FunctionsPieChart()
        return super().get_context_data(**kwargs)


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


class RobotView(TemplateView):
    template_name = "home/robots.txt"
    content_type = "text/plain"
