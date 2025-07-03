from django.http import HttpResponseRedirect
from formtools.wizard.views import SessionWizardView

from home.forms import SatisfactionFormNPS, SatisfactionFormSuggestedChange
from home.models import SatisfactionFormEntry


class SatisfactionView(SessionWizardView):
    form_list = [SatisfactionFormNPS, SatisfactionFormSuggestedChange]
    template_name = "home/satisfaction.html"

    def done(self, form_list, **kwargs):
        form_dict = self.get_all_cleaned_data()
        SatisfactionFormEntry.objects.create(
            **form_dict,
            user=self.request.user if self.request.user.is_authenticated else None,
        )
        return HttpResponseRedirect("/")
