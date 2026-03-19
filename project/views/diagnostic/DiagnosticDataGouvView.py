from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticDataGouvView(DiagnosticBaseView):
    template_name = "project/pages/downloads.html"
    page_section = "Téléchargement"
