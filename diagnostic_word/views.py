from typing import Any
from django.views.generic import TemplateView


class DicoView(TemplateView):
    template_name = "diagnostic_word/dico.html"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        return super().get_context_data(**kwargs)
