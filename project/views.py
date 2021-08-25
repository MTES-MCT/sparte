from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView

from .models import Project
from .tasks import import_shp


class ProjectListView(LoginRequiredMixin, ListView):
    queryset = Project.objects.all()
    template_name = "project/list.html"
    context_object_name = "projects"

    def get_queryset(self):
        # UPDATE: utiliser les permissions classiques de Django !!
        user = self.request.user
        return Project.objects.filter(user=user)


class ProjectDetailView(LoginRequiredMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/detail.html"
    context_object_name = "project"

    def get_queryset(self):
        # UPDATE: utiliser les permissions classiques de Django !!
        user = self.request.user
        # prefetch cities ?
        return Project.objects.filter(user=user)

    def get_context_data(self, **kwargs):
        super_context = super().get_context_data(**kwargs)
        table_artif = []
        table_percent = []
        pki_2009_ha = pki_2018_ha = 0
        total_surface = 0
        for city in self.object.cities.all():
            pki_2009_ha += city.artif_before_2009
            pki_2018_ha += city.total_artif()
            total_surface += city.surface

            items = list(city.list_artif())
            table_artif.append(
                {
                    "name": city.name,
                    "before": items.pop(0),
                    "items": items,
                    "total": city.total_artif(),
                    "surface": city.surface,
                }
            )
            items = list(city.list_percent())
            table_percent.append(
                {
                    "name": city.name,
                    "before": items.pop(0),
                    "items": items,
                    "total": f"{city.total_percent():.2%}",
                    "surface": city.surface,
                }
            )

        return {
            **super_context,
            "table_artif": table_artif,
            "table_percent": table_percent,
            "2009_ha": pki_2009_ha,
            "2009_percent": f"{pki_2009_ha / total_surface:.2%}",
            "2018_ha": pki_2018_ha,
            "2018_percent": f"{pki_2018_ha / total_surface:.2%}",
            "total_surface": total_surface,
        }


class ProjectMapView(LoginRequiredMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/full_carto.html"
    context_object_name = "project"

    def get_queryset(self):
        # UPDATE: utiliser les permissions classiques de Django !!
        user = self.request.user
        return Project.objects.filter(user=user)

    def get_context_data(self, **kwargs):
        context1 = super().get_context_data(**kwargs)
        # UPGRADE: add center and zoom fields on project model
        # values would be infered when emprise is loaded
        context2 = {
            # center map on France
            "carto_name": "Arcachon",
            "center_lat": 44.6586,
            "center_lng": -1.164,
            "default_zoom": 12,
            "layer_list": [
                {
                    "name": "Communes SYBARVALE",
                    "url": reverse_lazy("public_data:communessybarval-list"),
                    "immediate_display": False,
                    "gradient_url": reverse_lazy(
                        "public_data:communessybarval-gradient"
                    ),
                },
                {
                    "name": "Emprise du projet",
                    "url": reverse_lazy("project:emprise-list")
                    + f"?project_id={self.object.pk}",
                    "immediate_display": True,
                    "gradient_url": reverse_lazy("project:emprise-gradient"),
                },
                {
                    "name": "Artificialisation 2015 à 2018",
                    "url": reverse_lazy("public_data:artificialisee2015to2018-list"),
                    "immediate_display": True,
                    "gradient_url": reverse_lazy(
                        "public_data:artificialisee2015to2018-gradient"
                    ),
                },
                {
                    "name": "Renaturation de 2018 à 2015",
                    "url": reverse_lazy("public_data:renaturee2018to2015-list"),
                    "gradient_url": reverse_lazy(
                        "public_data:renaturee2018to2015-gradient"
                    ),
                },
                {
                    "name": "Zones Baties 2018",
                    "url": reverse_lazy("public_data:zonesbaties2018-list"),
                    "immediate_display": False,
                    "gradient_url": reverse_lazy(
                        "public_data:zonesbaties2018-gradient"
                    ),
                },
            ],
        }
        return {**context1, **context2}


class ProjectCreateView(LoginRequiredMixin, CreateView):
    model = Project
    template_name = "project/create.html"
    fields = ["name", "shape_file", "analyse_start_date", "analyse_end_date"]

    def form_valid(self, form):
        # required to set the user who is logged as creator
        form.instance.user = self.request.user
        response = super().form_valid(form)  # save the data in db
        # add asynchronous task to load emprise
        import_shp.delay(form.instance.id)
        return response

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs={"pk": self.object.id})


class ProjectUpdateView(LoginRequiredMixin, UpdateView):
    model = Project
    template_name = "project/update.html"
    fields = ["name", "shape_file", "analyse_start_date", "analyse_end_date"]
    context_object_name = "project"

    def get_success_url(self):
        return reverse_lazy("project:detail", kwargs=self.kwargs)


class ProjectDeleteView(LoginRequiredMixin, DeleteView):
    model = Project
    success_url = reverse_lazy("project:list")
