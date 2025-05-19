from django.views.generic import CreateView

from brevo.tasks import send_diagnostic_request_to_brevo
from project import tasks
from project.models import Project, Request, RequestedDocumentChoices
from public_data.infra.planning_competency.PlanningCompetencyServiceSudocuh import (
    PlanningCompetencyServiceSudocuh,
)


class DiagnosticDownloadView(CreateView):
    model = Request
    template_name = "project/components/forms/report_download.html"
    fields = [
        "first_name",
        "last_name",
        "function",
        "organism",
        "email",
    ]

    def get_context_data(self, **kwargs):
        if self.kwargs.get("requested_document") not in RequestedDocumentChoices.values:
            raise ValueError(f"Invalid report type {self.kwargs.get('requested_document')}")

        kwargs.update(
            {
                "project": Project.objects.get(pk=self.kwargs["pk"]),
                "requested_document": self.kwargs["requested_document"],
                "requested_document_label": RequestedDocumentChoices(self.kwargs["requested_document"]).label,
            }
        )
        return super().get_context_data(**kwargs)

    def get_initial(self):
        """Return the initial data to use for forms on this view."""
        initial = self.initial.copy()
        if self.request.user and not self.request.user.is_anonymous:
            initial.update(
                {
                    "first_name": self.request.user.first_name,
                    "last_name": self.request.user.last_name,
                    "function": self.request.user.function,
                    "organism": self.request.user.organism,
                    "email": self.request.user.email,
                }
            )
        return initial

    def form_valid(self, form):
        if self.request.user.is_authenticated:
            user = self.request.user
            form.instance.user = user
            user.first_name = form.instance.first_name or user.first_name
            user.last_name = form.instance.last_name or user.last_name
            user.function = form.instance.function or user.function
            user.organism = form.instance.organism or user.organism
            user.save()

        form.instance.project = Project.objects.get(pk=self.kwargs["pk"])
        form.instance.requested_document = self.kwargs["requested_document"]
        form.instance.du_en_cours = PlanningCompetencyServiceSudocuh.planning_document_in_revision(
            form.instance.project.land
        )
        form.instance.competence_urba = PlanningCompetencyServiceSudocuh.has_planning_competency(
            form.instance.project.land
        )
        form.instance._change_reason = "New request"
        new_request = form.save()
        send_diagnostic_request_to_brevo.delay(new_request.id)
        tasks.send_email_request_bilan.delay(new_request.id)
        tasks.generate_word_diagnostic.apply_async((new_request.id,), link=tasks.send_word_diagnostic.s())
        return self.render_to_response(self.get_context_data(success_message=True))
