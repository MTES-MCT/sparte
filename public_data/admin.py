from django.contrib.gis import admin

from import_export import resources
from import_export.admin import ImportMixin

from .models import (
    ArtifCommune,
    Artificialisee2015to2018,
    Artificielle2018,
    CommunesSybarval,
    EnveloppeUrbaine2018,
    Renaturee2018to2015,
    Sybarval,
    Voirie2018,
    ZonesBaties2018,
)


class DefaultAdmin(admin.GeoModelAdmin):
    pass


@admin.register(CommunesSybarval)
class CommunesSybarvalAdmin(admin.GeoModelAdmin):
    model = CommunesSybarval
    list_display = (
        "nom",
        "code_insee",
        "statut",
        "_nom_epci",
        "_siren_epc",
    )
    list_filter = ("_nom_epci",)
    search_fields = (
        "nom",
        "code_insee",
    )
    ordering = ("nom",)


@admin.register(Artificialisee2015to2018)
class Artificialisee2015to2018Admin(admin.GeoModelAdmin):
    model = Artificialisee2015to2018
    list_display = (
        "surface",
        "cs_2018",
        "us_2018",
        "cs_2015",
        "us_2015",
    )


admin.site.register(Artificielle2018, DefaultAdmin)
admin.site.register(EnveloppeUrbaine2018, DefaultAdmin)
admin.site.register(Renaturee2018to2015, DefaultAdmin)
admin.site.register(Sybarval, DefaultAdmin)
admin.site.register(Voirie2018, DefaultAdmin)
admin.site.register(ZonesBaties2018, DefaultAdmin)


class ArtifCommuneResource(resources.ModelResource):
    class Meta:
        model = ArtifCommune
        import_id_fields = ("insee",)
        exclude = ("id",)


@admin.register(ArtifCommune)
class ArtifCommuneAdmin(ImportMixin, admin.GeoModelAdmin):
    model = ArtifCommune
    list_display = (
        "name",
        "insee",
        "surface",
        "artif_before_2009",
        "artif_2009",
        "artif_2010",
    )
    search_fields = (
        "name",
        "insee",
    )
    ordering = ("name",)
    # for importation
    resource_class = ArtifCommuneResource
