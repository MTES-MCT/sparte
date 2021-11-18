import pandas as pd

from django.db.models import F
from django.views.generic import TemplateView

from .models import CouvertureUsageMatrix


class DisplayMatrix(TemplateView):
    template_name = "public_data/us_cs_matrix.html"

    def get_context_data(self, **kwargs):
        qs = CouvertureUsageMatrix.objects.exclude(
            label=CouvertureUsageMatrix.LabelChoices.NONE
        )
        # qs = qs.select_related("couverture", "usage")
        qs = qs.annotate(couverture_code=F("couverture__code_prefix"))
        qs = qs.annotate(usage_code=F("usage__code_prefix"))
        qs = qs.values("couverture_code", "usage_code", "label")
        # make the matrix using dataframe pivot
        df = pd.DataFrame(list(qs))
        df = df.pivot(index="usage_code", columns="couverture_code", values="label")
        # make html repr
        html = df.to_html(na_rep="", classes="table table-sm")
        html = html.replace(
            "<td>ARTIF_NOT_CONSU</td>",
            "<td style='background-color:#fc6e9e !important'>Artif non consommé</td>",
        )
        html = html.replace(
            "<td>ARTIF</td>",
            "<td style='background-color:#fe246d !important'>Artificiel</td>",
        )
        html = html.replace(
            "<td>NAF</td>", "<td style='background-color:#0e7100 !important'>NAF</td>"
        )
        html = html.replace(
            "<td>CONSU</td>",
            "<td style='background-color:#6fd261 !important'>Consommé</td>",
        )
        return {
            **super().get_context_data(**kwargs),
            "matrix": html,
        }
