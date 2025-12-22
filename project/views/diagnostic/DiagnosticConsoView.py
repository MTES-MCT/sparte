from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticConsoView(DiagnosticBaseView):
    partial_template_name = None
    full_template_name = "project/pages/consommation.html"
