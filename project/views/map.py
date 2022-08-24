from jenkspy import jenks_breaks

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Max, Sum, F
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import DetailView

from public_data.models import AdminRef, Cerema
from utils.colors import get_yellow2red_gradient

from project.models import Project
from .mixins import GroupMixin


class ProjectMapView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/full_carto.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs.append({"href": None, "title": "Carte intéractive"})
        return breadcrumbs

    def get_context_data(self, **kwargs):
        # UPGRADE: add center and zoom fields on project model
        # values would be infered when emprise is loaded
        center = self.object.get_centroid()
        kwargs.update(
            {
                # center map on France
                "carto_name": "Project",
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 10,
                "layer_list": [
                    {
                        "name": "Communes",
                        "url": reverse_lazy(
                            "project:project-communes", args=[self.object.id]
                        ),
                        "display": False,
                        "level": "2",
                        "style": "style_communes",
                    },
                    {
                        "name": "Emprise du projet",
                        "url": reverse_lazy("project:emprise-list")
                        + f"?id={self.object.pk}",
                        "display": True,
                        "style": "style_emprise",
                        "fit_map": True,
                        "level": "5",
                    },
                    {
                        "name": "Arcachon: Couverture 2015",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2015&color=couverture"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Arcachon: Couverture 2018",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2018&color=couverture"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Arcachon: Usage 2015",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2015&color=usage"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Arcachon: Usage 2018",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2018&color=usage"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Archachon : artificialisation 2015 à 2018",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2015&year_new=2018&is_new_artif=true"
                        ),
                        "display": False,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Arcachon : renaturation de 2015 à 2018",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2015&year_new=2018&is_new_natural=true"
                        ),
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                        "display": False,
                    },
                    {
                        "name": "Arcachon: zones artificielles 2015",
                        "url": (
                            f'{reverse_lazy("public_data:artificialarea-optimized")}'
                            "?year=2015"
                        ),
                        "display": False,
                        "level": "3",
                        "style": "style_zone_artificielle",
                    },
                    {
                        "name": "Arcachon: zones artificielles 2018",
                        "url": (
                            f'{reverse_lazy("public_data:artificialarea-optimized")}'
                            "?year=2018"
                        ),
                        "display": False,
                        "level": "3",
                        "style": "style_zone_artificielle",
                    },
                    {
                        "name": "Gers: Couverture 2016",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2016&color=couverture"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Couverture 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2019&color=couverture"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Usage 2016",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2016&color=usage"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: Usage 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsge-optimized")}'
                            "?year=2019&color=usage"
                        ),
                        "display": False,
                        "color_property_name": "map_color",
                        "style": "get_color_from_property",
                        "level": "1",
                    },
                    {
                        "name": "Gers: artificialisation 2016 à 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2016&year_new=2019&is_new_artif=true"
                        ),
                        "display": False,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Gers: renaturation 2016 à 2019",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            "?year_old=2016&year_new=2019&is_new_natural=true"
                        ),
                        "display": False,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Gers: zones construites 2016",
                        "url": (
                            f'{reverse_lazy("public_data:zoneconstruite-optimized")}'
                            "?year=2016"
                        ),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                    {
                        "name": "Gers: zones construites 2019",
                        "url": (
                            f'{reverse_lazy("public_data:zoneconstruite-optimized")}'
                            "?year=2019"
                        ),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                    {
                        "name": "Gers: zones artificielles 2016",
                        "url": (
                            f'{reverse_lazy("public_data:artificialarea-optimized")}'
                            "?year=2016"
                        ),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                    {
                        "name": "Gers: zones artificielles 2019",
                        "url": (
                            f'{reverse_lazy("public_data:artificialarea-optimized")}'
                            "?year=2019"
                        ),
                        "display": False,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                ],
            }
        )
        return super().get_context_data(**kwargs)


class MyArtifMapView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/theme_map.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"title": "Comprendre l'artificialisation du territoire"},
        ]
        return breadcrumbs

    def get_context_data(self, **kwargs):
        years = (
            self.object.cities.all()
            .first()
            .communediff_set.all()
            .aggregate(old=Max("year_old"), new=Max("year_new"))
        )
        center = self.object.get_centroid()
        kwargs.update(
            {
                # center map on France
                "map_name": "Comprendre mon artificialisation",
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 10,
                "year_old": years["old"],
                "year_new": years["new"],
                "layer_list": [
                    {
                        "name": "Emprise du projet",
                        "url": (
                            f'{reverse_lazy("project:emprise-list")}'
                            f"?id={self.object.pk}"
                        ),
                        "display": True,
                        "style": "style_emprise",
                        "fit_map": True,
                        "level": "5",
                    },
                    {
                        "name": "Artificialisation",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            f"?year_old={years['old']}&year_new={years['new']}"
                            f"&is_new_artif=true"
                        ),
                        "display": True,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Renaturation",
                        "url": (
                            f'{reverse_lazy("public_data:ocsgediff-optimized")}'
                            f"?year_old={years['old']}&year_new={years['new']}"
                            "&is_new_natural=true"
                        ),
                        "display": True,
                        "style": "get_color_for_ocsge_diff",
                        "level": "7",
                    },
                    {
                        "name": "Zones artificielles",
                        "url": (
                            f'{reverse_lazy("public_data:artificialarea-optimized")}'
                            f"?year={years['new']}"
                        ),
                        "display": True,
                        "style": "style_zone_artificielle",
                        "level": "3",
                    },
                ],
            }
        )
        return super().get_context_data(**kwargs)


class CitySpaceConsoMapView(GroupMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "carto/theme_map.html"
    context_object_name = "project"

    def get_context_breadcrumbs(self):
        breadcrumbs = super().get_context_breadcrumbs()
        breadcrumbs += [
            {"title": "Consommation d'espace des communes de mon territoire"},
        ]
        return breadcrumbs

    def get_context_data(self, **kwargs):
        center = self.object.get_centroid()
        kwargs.update(
            {
                # center map on France
                "map_name": "Consommation des villes de mon territoire",
                "center_lat": center.y,
                "center_lng": center.x,
                "default_zoom": 8,
                "layer_list": [
                    {
                        "name": "Emprise du projet",
                        "url": (
                            f'{reverse_lazy("project:emprise-list")}'
                            f"?id={self.object.pk}"
                        ),
                        "display": True,
                        "style": "style_emprise",
                        "fit_map": True,
                        "level": "5",
                    },
                    {
                        "name": "Consommation des communes",
                        "url": reverse_lazy(
                            "project:project-communes", args=[self.object.id]
                        ),
                        "display": True,
                        "gradient_url": reverse_lazy(
                            "project:gradient", args=[self.object.id, "json"]
                        ),
                        "level": "2",
                        "color_property_name": "artif_area",
                    },
                ],
            }
        )
        return super().get_context_data(**kwargs)


class ProjectGradientView(GroupMixin, LoginRequiredMixin, DetailView):
    queryset = Project.objects.all()
    template_name = "project/gradient.html"

    def get_level(self):
        level = self.kwargs.get("level", self.object.level)
        if level == AdminRef.COMMUNE:
            return "city_name"
        elif level == AdminRef.EPCI:
            return "epci_name"
        elif level == AdminRef.DEPARTEMENT:
            return "dept_name"
        elif level == AdminRef.REGION:
            return "region_name"
        elif level == AdminRef.SCOT:
            return "scot"
        else:
            return "city_name"

    def get_gradient(self):
        # level = self.get_level()
        fields = Cerema.get_art_field(
            self.object.analyse_start_date, self.object.analyse_end_date
        )
        qs = (
            self.object.get_cerema_cities()
            .annotate(conso=sum([F(f) for f in fields]) / 10000)
            .values("city_name")
            .annotate(conso=Sum(F("conso")))
            .order_by("conso")
        )
        if qs.count() <= 9:
            boundaries = sorted([i["conso"] for i in qs])
        else:
            boundaries = jenks_breaks([i["conso"] for i in qs], nb_class=9)[1:]
        return [
            {"value": v, "color": c.hex_l}
            for v, c in zip(boundaries, get_yellow2red_gradient(len(boundaries)))
        ]

    def get_context_data(self, **kwargs):
        kwargs["gradients"] = self.get_gradient()
        kwargs["headers"] = self.request.headers
        return super().get_context_data(**kwargs)

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.kwargs["format"] == "json":
            return JsonResponse(self.get_gradient(), safe=False)
        else:
            context = self.get_context_data(object=self.object)
            return self.render_to_response(context)
