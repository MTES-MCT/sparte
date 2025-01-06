from django.views.generic import FormView

from home.forms import NewsletterForm
from home.tasks import send_nwl_confirmation


class NewsletterSubscriptionView(FormView):
    form_class = NewsletterForm
    template_name = "home/newsletter.html"

    def form_valid(self, form):
        self.object = form.save()
        send_nwl_confirmation.delay(self.object.id)
        return self.render_to_response(self.get_context_data())
