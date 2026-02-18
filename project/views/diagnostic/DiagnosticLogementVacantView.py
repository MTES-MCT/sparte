from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticLogementVacantView(DiagnosticBaseView):
    template_name = "project/pages/logement_vacant.html"
    page_section = "Vacance des logements"
