from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from home.forms import NewsletterForm
from project.models import RNUPackage
from utils.views_mixins import BreadCrumbMixin


class DownloadView(LoginRequiredMixin, BreadCrumbMixin, TemplateView):
    template_name = "home/download.html"

    def get_context_data(self, **kwargs):
        kwargs |= {
            "form": NewsletterForm(),
            "rnu_packages": RNUPackage.objects.all().order_by("departement_official_id"),
        }
        return super().get_context_data(**kwargs)
