from django.core.management.base import BaseCommand
from django.urls import reverse

from utils.emails import SibTemplateEmail
from utils.functions import get_url_with_domain
from project.models import Request


class Command(BaseCommand):
    def handle(self, *args, **options):
        print("Send test email...")
        request_id = 39
        request = Request.objects.get(pk=request_id)
        diagnostic = request.project
        project_url = get_url_with_domain(reverse("project:detail", args=[diagnostic.id]))
        relative_url = get_url_with_domain(reverse("admin:project_request_change", kwargs={"object_id": request.id}))
        diagnostic = request.project
        image_url = "https://creative-assets.mailinblue.com/editor/image_placeholder.png"
        if diagnostic.cover_image:
            image_url = diagnostic.cover_image.url
        email = SibTemplateEmail(
            template_id=1,
            subject=f"Demande de bilan - {request.email} - {diagnostic.name}",
            recipients=[{"name": "Team SPARTE", "email": "swann.bouviermuller@gmail.com"}],
            params={
                "diagnostic_name": diagnostic.name,
                "user_email": request.email,
                "user_organism": request.organism,
                "user_function": request.function,
                "admin_request": relative_url,
                "image_url": image_url,
                "project_url": project_url,
            },
        )
        print(email.send())
