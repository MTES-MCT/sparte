from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView, FormView

from .forms import DisplayOcsgeForm


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
                "display": True,
            },
            {
                "name": "Zones artificielles",
                "url": reverse_lazy("public_data:artificielle2018-list"),
                "display": False,
            },
            {
                "name": "Communes SYBARVAL",
                "url": reverse_lazy("public_data:communessybarval-list"),
                "display": False,
            },
            {
                "name": "Enveloppes urbaines",
                "url": reverse_lazy("public_data:enveloppeurbaine2018-list"),
                "display": False,
            },
            {
                "name": "Renaturation de 2018 à 2015",
                "url": reverse_lazy("public_data:renaturee2018to2015-list"),
            },
            {
                "name": "Emprise Sybarval",
                "url": reverse_lazy("public_data:sybarval-list"),
                "display": False,
            },
            {
                "name": "Voirie 2018",
                "url": reverse_lazy("public_data:voirie2018-list"),
                "display": False,
            },
            {
                "name": "Zones Baties 2018",
                "url": reverse_lazy("public_data:zonesbaties2018-list"),
                "display": False,
            },
        ],
    }
    return render(request, "carto/full_carto.html", context=context)


class Ocsge2015MapView(LoginRequiredMixin, TemplateView):
    template_name = "carto/full_carto.html"

    def get_context_data(self, **kwargs):
        url = reverse_lazy("public_data:ocsge-optimized") + "?year=2015&color=usage"
        context = super().get_context_data(**kwargs)
        context.update(
            {
                # center map on France
                "carto_name": "OCSGE 2015",
                "center_lat": 44.6586,
                "center_lng": -1.164,
                "default_zoom": 12,
                "layer_list": [
                    {
                        "name": "OCSGE 2015 - Usage du sol",
                        "url": url,
                        "display": True,
                        "level": "1",
                        "color_property_name": "map_color",
                    },
                ],
            }
        )
        return context


class OcsgeMapViewSet(LoginRequiredMixin, FormView):
    form_class = DisplayOcsgeForm
    initial = {"millesime": "2015", "color": "usage"}

    def get_template_names(self):
        if self.request.method == "GET":
            return ["carto/ocsge_form.html"]
        else:
            return ["carto/full_carto.html"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.method == "POST":
            context.update(self.get_context_map(**context))
        return context

    def get_context_map(self, **kwargs):
        form = kwargs["form"]
        url = reverse_lazy("public_data:ocsge-optimized")
        url += f"?year={form.cleaned_data['millesime']}"
        url += f"&color={form.cleaned_data['color']}"
        context = {
            "carto_name": "OCSGE",
            "center_lat": 44.6586,
            "center_lng": -1.164,
            "default_zoom": 12,
            "layer_list": [
                {
                    "name": "OCSGE 2015 - Usage du sol",
                    "url": url,
                    "display": True,
                    "level": "1",
                    "color_property_name": "map_color",
                },
            ],
        }
        return context

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests: instantiate a form instance with the passed
        POST variables and then check if it's valid.
        """
        form = self.get_form()
        if form.is_valid():
            return self.render_to_response(self.get_context_data(form=form))
        else:
            return self.form_invalid(form)
