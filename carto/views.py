from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView


class HomeConnected(LoginRequiredMixin, TemplateView):
    template_name = "index.html"


@login_required
def arcachon(request):
    """Center the map on Arcachon"""
    context = {
        # center map on France
        "carto_name": "Arcachon",
        "center_lat": 44.6586,
        "center_lng": -1.164,
        "default_zoom": 12,
        "layer_list": [
            {
                "name": "Artificialisation 2015 à 2018",
                "url": reverse_lazy("public_data:artificialisee2015to2018-list"),
                "immediate_display": True,
            },
            {
                "name": "Zones artificielles",
                "url": reverse_lazy("public_data:artificielle2018-list"),
                "immediate_display": False,
            },
            {
                "name": "Communes SYBARVAL",
                "url": reverse_lazy("public_data:communessybarval-list"),
                "immediate_display": False,
            },
            {
                "name": "Enveloppes urbaines",
                "url": reverse_lazy("public_data:enveloppeurbaine2018-list"),
                "immediate_display": False,
            },
            {
                "name": "Renaturation de 2018 à 2015",
                "url": reverse_lazy("public_data:renaturee2018to2015-list"),
            },
            {
                "name": "Emprise Sybarval",
                "url": reverse_lazy("public_data:sybarval-list"),
                "immediate_display": False,
            },
            {
                "name": "Voirie 2018",
                "url": reverse_lazy("public_data:voirie2018-list"),
                "immediate_display": False,
            },
            {
                "name": "Zones Baties 2018",
                "url": reverse_lazy("public_data:zonesbaties2018-list"),
                "immediate_display": False,
            },
        ],
    }
    return render(request, "carto/full_carto.html", context=context)
