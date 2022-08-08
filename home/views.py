from django.contrib import messages
from django.http import HttpResponseRedirect
from django.views.generic import TemplateView, CreateView, RedirectView

from django_app_parameter import app_parameter

from project.models import Request
from utils.views_mixins import BreadCrumbMixin

from . import charts

# from .forms import ContactForm
from .models import ContactForm, Newsletter
from .tasks import send_contact_form, send_nwl_confirmation


class TestView(TemplateView):
    template_name = "home/test.html"


class HomeView(BreadCrumbMixin, TemplateView):
    template_name = "home/home.html"


class AccessView(BreadCrumbMixin, TemplateView):
    template_name = "home/accessibilite.html"


class LegalNoticeView(BreadCrumbMixin, TemplateView):
    template_name = "home/legal_notices.html"


class PrivacyView(BreadCrumbMixin, TemplateView):
    template_name = "home/privacy.html"


class StatsView(BreadCrumbMixin, TemplateView):
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


class RobotView(TemplateView):
    template_name = "home/robots.txt"
    content_type = "text/plain"


class ContactView(CreateView):
    model = ContactForm
    template_name = "home/contact.html"
    success_url = "/"
    fields = ["email", "content"]

    def form_valid(self, form):
        self.object = form.save()
        send_contact_form.delay(self.object.id)
        messages.success(
            self.request, "Votre message a été envoyé à l'équipe de SPARTE."
        )
        return HttpResponseRedirect(self.get_success_url())


class NewsletterCreateView(CreateView):
    model = Newsletter
    template_name = "home/newsletter.html"
    success_url = "/"
    fields = ["email"]

    def form_valid(self, form):
        self.object = form.save()
        send_nwl_confirmation.delay(self.object.id)
        messages.success(
            self.request,
            (
                "Votre inscription a été prise en compte. Vous allez recevoir un e-mail"
                " vous demandant de confirmer votre souhait."
            ),
        )
        return HttpResponseRedirect(self.get_success_url())


class NewsLetterConfirmationView(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        try:
            nwl = Newsletter.objects.get(confirm_token=self.kwargs["token"])
            nwl.confirm()
            messages.success(
                self.request,
                "Félicitation, vous êtes maintenant inscrit à l'inforlettre.",
            )
        except Newsletter.DoesNotExist:
            messages.error(
                self.request, "Confirmation impossible, le jeton fourni est inconnu."
            )
        return "/"
