from django.views.generic import TemplateView

from home.forms import NewsletterForm
from utils.views_mixins import BreadCrumbMixin


class HomeView(BreadCrumbMixin, TemplateView):
    template_name = "home/home.html"

    def get_context_data(self, **kwargs):
        kwargs["form"] = NewsletterForm()
        return super().get_context_data(**kwargs)
