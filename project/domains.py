from django.db.models import Sum

from public_data.models import Artificielle2018 as Artif
from public_data.models import Renaturee2018to2015 as Renat

from .models import Project


def get_queryset(klass, geom):
    """Return SUM(surface) GROUP BY cs_2018 for all objects covered by geom"""
    qs = klass.objects.filter(mpoly__coveredby=geom)
    qs = qs.values("cs_2018").order_by("cs_2018")
    qs = qs.annotate(total_surface=Sum("surface"))
    return qs


def get_couverture_sol(project: Project) -> dict():
    """Pour un projet donné, renvoi la surface occupé en fonction de la CS

    Return [
            <CouvertureSol 1>,  # item.total_surface = 288 = 100 + 78 + 45 + 65
            <CouvertureSol 1.1>,  # item.total_surface = 143 = 78 + 65
            <CouvertureSol 1.1.1>,  # item.total_surface = 65
            <CouvertureSol 1.2>,  # item.total_surface = 45
        ]
    """

    geom = project.combined_emprise
    qs_artif = Artif.get_groupby_couverture(geom)
    qs_renat = get_queryset(Renat, geom)

    # union of both queryset
    raw_cover = {**dict(qs_artif), **dict(qs_renat)}

    data = CouvertureSol.get_aggregated_cover(raw_cover)
    return data
