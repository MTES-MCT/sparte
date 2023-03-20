from django.contrib.gis import admin
from import_export import resources
from import_export.admin import ImportExportMixin

from .models import (
    Cerema,
    Commune,
    CouvertureSol,
    CouvertureUsageMatrix,
    Departement,
    Epci,
    Ocsge,
    Region,
    UsageSol,
)


class UsageSolResource(resources.ModelResource):
    class Meta:
        model = UsageSol


@admin.register(UsageSol)
class UsageSolAdmin(ImportExportMixin, admin.GeoModelAdmin):
    model = UsageSol
    list_display = ("code", "label", "parent", "map_color")
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

    def before_import(self, *args, **kwargs):
        return super().before_import(*args, **kwargs)


@admin.register(CouvertureSol)
class CouvertureSolAdmin(ImportExportMixin, admin.GeoModelAdmin):
    model = CouvertureSol
    list_display = ("code", "label", "parent", "map_color")
    list_filter = ("parent",)
    search_fields = ("code", "label", "map_color")
    ordering = ("code",)
    # for importation
    resource_class = CouvertureSolImportResource


@admin.register(Ocsge)
class OcsgeAdmin(admin.GeoModelAdmin):
    model = Ocsge
    list_display = (
        "id",
        "couverture",
        "couverture_label",
        "usage",
        "usage_label",
        "year",
    )
    list_filter = ("year", "couverture", "usage")
    search_fields = (
        "couverture",
        "couverture_label",
        "usage",
        "usage_label",
        "year",
    )


class CouvertureUsageMatrixImportResource(resources.ModelResource):
    class Meta:
        model = CouvertureUsageMatrix
        import_id_fields = ("id",)
        skip_unchanged = True


@admin.register(CouvertureUsageMatrix)
class CouvertureUsageMatrixAdmin(ImportExportMixin, admin.GeoModelAdmin):
    model = CouvertureUsageMatrix
    list_display = (
        "id",
        "couverture",
        "usage",
        "is_artificial",
        "is_consumed",
    )
    list_filter = ("is_artificial", "is_consumed", "is_natural")
    search_fields = ("couverture__code_prefix", "usage__code_prefix")
    resource_class = CouvertureUsageMatrixImportResource


@admin.register(Region)
class RegionAdmin(admin.GeoModelAdmin):
    model = Region
    list_display = (
        "id",
        "name",
        "source_id",
    )
    search_fields = ("name", "source_id")
    ordering = ("name",)


@admin.register(Departement)
class DepartementAdmin(admin.GeoModelAdmin):
    model = Departement
    list_display = (
        "id",
        "name",
        "source_id",
        "region",
    )
    search_fields = ("name", "source_id")
    ordering = ("name",)


@admin.register(Epci)
class EpciAdmin(admin.GeoModelAdmin):
    model = Epci
    list_display = (
        "id",
        "name",
        "source_id",
    )
    search_fields = ("name", "source_id")
    ordering = ("name",)


@admin.register(Commune)
class CommuneAdmin(admin.GeoModelAdmin):
    model = Commune
    list_display = (
        "insee",
        "name",
    )
    search_fields = ("name", "insee")
    ordering = ("insee",)


@admin.register(Cerema)
class CeremaAdmin(admin.GeoModelAdmin):
    model = Cerema
    list_display = (
        "city_insee",
        "city_name",
        "region_id",
        "region_name",
        "dept_id",
        "dept_name",
        "epci_id",
        "epci_name",
    )
    search_fields = ("city_insee", "city_name", "region_name", "dept_name", "epci_name")
    ordering = ("city_insee",)
