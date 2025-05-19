from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views.generic import TemplateView

from project.models import Request


class DiagnosticDownloadWordView(TemplateView):
    template_name = "project/pages/error_download_word.html"

    def get(self, request, *args, **kwargs):
        """Redirect vers le fichier word du diagnostic si: le diagnostic est public ou est associé à l'utilisateur
        connecté. Sinon, affiche une page d'erreur."""
        req = Request.objects.get(pk=self.kwargs["request_id"])
        if req.project and req.project.is_public:  # le diagnostic est public
            return HttpResponseRedirect(req.sent_file.url)
        # le diagnostic n'est pas public, on vérifie que l'utilisateur connecté est bien le propriétaire du diagnostic
        if request.user.is_anonymous:
            messages.info(
                request,
                "Vous essayez d'accéder à un document privé. Veuillez vous connecter.",
            )
            return HttpResponseRedirect(f"{reverse('users:signin')}?next={request.path}")
        if request.user.id == req.user_id:
            return HttpResponseRedirect(req.sent_file.url)
        return super().get(request, *args, **kwargs)
