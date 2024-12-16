from django.conf import settings
from django.views.generic import CreateView

from home.models import ContactForm


class ContactView(CreateView):
    model = ContactForm
    template_name = "home/contact.html"
    success_url = "/"
    fields = ["email", "content"]

    def get_context_data(self, **kwargs):
        kwargs["crisp_website_id"] = settings.CRISP_WEBSITE_ID
        return super().get_context_data(**kwargs)
