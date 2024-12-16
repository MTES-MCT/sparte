from django.views.generic import FormView

from home.forms import NewsletterForm
from home.tasks import send_nwl_confirmation


class NewsletterConfirmationSubscriptionView(FormView):
    template_name = "home/partials/newsletter_confirm_subscription.html"
    form_class = NewsletterForm

    def form_valid(self, form):
        self.object = form.save()
        send_nwl_confirmation.delay(self.object.id)
        return self.render_to_response(self.get_context_data())
