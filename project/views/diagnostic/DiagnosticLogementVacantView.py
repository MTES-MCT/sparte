from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticLogementVacantView(DiagnosticBaseView):
    partial_template_name = None
    full_template_name = "project/pages/logement_vacant.html"
