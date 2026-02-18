from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticDownloadsView(DiagnosticBaseView):
    template_name = "project/pages/downloads.html"
    page_section = "Téléchargements"
