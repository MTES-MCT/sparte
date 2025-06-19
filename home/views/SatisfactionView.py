from django.views.generic import FormView

from home.forms import SatisfactionForm


class SatisfactionView(FormView):
    form_class = SatisfactionForm
    template_name = "home/satisfaction.html"
    success_url = "/"
