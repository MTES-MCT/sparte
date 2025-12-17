from django.contrib import messages
from django.views.generic import RedirectView

from home.models import Newsletter
from home.services import send_nwl_final


class NewsletterEmailValidationView(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        try:
            nwl = Newsletter.objects.get(confirm_token=self.kwargs["token"])
            nwl.confirm()
            messages.success(
                self.request,
                "Félicitation, vous êtes maintenant inscrit à la newsletter.",
            )
            send_nwl_final(nwl.id)
        except Newsletter.DoesNotExist:
            messages.error(self.request, "Confirmation impossible, le jeton fourni est inconnu.")
        return "/"
