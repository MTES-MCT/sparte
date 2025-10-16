from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticConsoView(DiagnosticBaseView):
    """
    Vue simplifiée pour la page de consommation.
    La version React de la page récupère les données via l'API,
    cette vue ne sert qu'à rendre le template de base.
    """

    partial_template_name = "project/components/dashboard/consommation_react.html"
    full_template_name = "project/pages/consommation.html"
