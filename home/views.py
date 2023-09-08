from typing import Any
from django.contrib import messages
from django.contrib.auth.mixins import UserPassesTestMixin
from django.db.models import F, Value
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.views.generic import CreateView, FormView, RedirectView, TemplateView
from django_app_parameter import app_parameter

from project.models import Request
from users.models import User
from utils.functions import get_url_with_domain
from utils.htmx import HtmxRedirectMixin, StandAloneMixin
from utils.views_mixins import BreadCrumbMixin

from . import charts
from .forms import NewsletterForm
from .models import ContactForm, Newsletter
from .tasks import send_contact_form, send_nwl_confirmation, send_nwl_final


class TestView(TemplateView):
    template_name = "home/test.html"


class HomeView(BreadCrumbMixin, TemplateView):
    template_name = "home/home.html"

    def get_context_data(self, **kwargs):
        kwargs["form"] = NewsletterForm()
        return super().get_context_data(**kwargs)


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
        kwargs["cout_portrait"] = int(round(kwargs["budget"] / kwargs["nb_dl_portrait"], 0))
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
        messages.success(self.request, "Votre message a été envoyé à l'équipe de Mon Diagnostic Artificialisation.")
        return HttpResponseRedirect(self.get_success_url())


class NewsletterSubscriptionView(FormView):
    template_name = "home/partials/newsletter_confirm_subscription.html"
    form_class = NewsletterForm

    def form_valid(self, form):
        self.object = form.save()
        send_nwl_confirmation.delay(self.object.id)
        return self.render_to_response(self.get_context_data())


class NewsLetterConfirmationView(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        try:
            nwl = Newsletter.objects.get(confirm_token=self.kwargs["token"])
            nwl.confirm()
            messages.success(
                self.request,
                "Félicitation, vous êtes maintenant inscrit à la newsletter.",
            )
            send_nwl_final.delay(nwl.id)
        except Newsletter.DoesNotExist:
            messages.error(self.request, "Confirmation impossible, le jeton fourni est inconnu.")
        return "/"


class AllEmailsView(UserPassesTestMixin, TemplateView):
    template_name = "home/all_emails.html"
    login_url = "users:signin"
    permission_denied_message = "Vous devez faire partie de l'équipe d'administration pour accéder à cette page."

    def test_func(self):
        """Only staff member should be able to see this page"""
        return self.request.user.is_staff

    def get_context_data(self, **kwargs):
        email_list = dict()

        def merge(rows):
            for row in rows:
                email = row.pop("email")
                if email not in email_list:
                    email_list[email] = row
                else:
                    if "created_date" in email_list[email]:
                        row["created_date"] = min(row["created_date"], email_list[email]["created_date"])
                    email_list[email].update(row)

        merge(
            (
                User.objects.all()
                .annotate(is_user=Value(True))
                .annotate(created_date=F("date_joined"))
                .values("email", "is_user", "created_date")
            )
        )
        merge((Request.objects.all().annotate(is_request=Value(True)).values("email", "is_request", "created_date")))
        merge(
            (
                ContactForm.objects.all()
                .annotate(is_contact_form=Value(True))
                .values("email", "is_contact_form", "created_date")
            )
        )
        merge((Newsletter.objects.all().annotate(is_nwl=Value(True)).values("email", "is_nwl", "created_date")))

        kwargs.update({"email_list": email_list})
        return super().get_context_data(**kwargs)


class MaintenanceView(StandAloneMixin, HtmxRedirectMixin, TemplateView):
    template_name = "home/partials/maintenance.html"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        kwargs["next"] = self.request.GET.get("next", "/")
        return super().get_context_data(**kwargs)

    def get_redirect_url(self):
        return get_url_with_domain(self.request.GET.get('next', '/'))

    def get(self, request, *args, **kwargs):
        if not app_parameter.MAINTENANCE_MODE:
            if request.META.get('HTTP_HX_REQUEST'):
                return self.htmx_redirect()
            else:
                return redirect(self.request.GET.get('next', '/'))
        return super().get(request, *args, **kwargs)
