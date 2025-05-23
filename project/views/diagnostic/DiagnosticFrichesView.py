from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticFrichesView(DiagnosticBaseView):
    partial_template_name = None
    full_template_name = "project/pages/friches.html"
