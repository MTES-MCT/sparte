from django.views.generic import TemplateView


class CarteNationaleView(TemplateView):
    """Carte nationale interactive de l'artificialisation.

    Page autonome, indépendante des diagnostics territoriaux. Le contenu
    (menu latéral et carte) est rendu côté React.
    """

    template_name = "home/carte_nationale.html"

    def get_context_data(self, **kwargs):
        kwargs["page_title"] = "Carte nationale"
        return super().get_context_data(**kwargs)
