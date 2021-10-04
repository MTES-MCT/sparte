from django.contrib.gis import admin

from import_export import resources
from import_export.admin import ImportExportMixin

from .models import (
    ArtifCommune,
    Artificialisee2015to2018,
    Artificielle2018,
    CommunesSybarval,
    CouvertureSol,
    EnveloppeUrbaine2018,
    Ocsge2015,
    Ocsge2018,
    Renaturee2018to2015,
    Sybarval,
    UsageSol,
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
class ArtifCommuneAdmin(ImportExportMixin, admin.GeoModelAdmin):
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


class UsageSolResource(resources.ModelResource):
    class Meta:
        model = UsageSol
        import_id_fields = ("code",)
        exclude = (
            "id",
            "parent",
        )


@admin.register(UsageSol)
class UsageSolAdmin(ImportExportMixin, admin.GeoModelAdmin):
    model = UsageSol
    list_display = (
        "code",
        "label",
        "parent",
    )
    list_filter = ("parent",)
    search_fields = (
        "code",
        "label",
    )
    ordering = ("code",)
    # for importation
    resource_class = UsageSolResource


class CouvertureSolImportResource(resources.ModelResource):
    class Meta:
        model = CouvertureSol
        import_id_fields = ("code",)
        exclude = (
            "id",
            "parent",
        )

    def before_import(self, *args, **kwargs):
        return super().before_import(*args, **kwargs)


@admin.register(CouvertureSol)
class CouvertureSolAdmin(ImportExportMixin, admin.GeoModelAdmin):
    model = CouvertureSol
    list_display = (
        "code",
        "label",
        "is_artificial",
        "parent",
    )
    list_filter = (
        "is_artificial",
        "parent",
    )
    search_fields = (
        "code",
        "label",
    )
    ordering = ("code",)
    # for importation
    resource_class = CouvertureSolImportResource


@admin.register(Ocsge2015)
class Ocsge2015Admin(admin.GeoModelAdmin):
    model = Ocsge2015
    list_display = (
        "id",
        "couverture",
        "couverture_label",
        "usage",
        "usage_label",
    )
    list_filter = ("couverture", "usage")
    search_fields = (
        "couverture",
        "usage",
    )


@admin.register(Ocsge2018)
class Ocsge2018Admin(admin.GeoModelAdmin):
    model = Ocsge2018
    list_display = (
        "id",
        "couverture",
        "couverture_label",
        "usage",
        "usage_label",
    )
    list_filter = ("couverture", "usage")
    search_fields = (
        "couverture",
        "usage",
    )
