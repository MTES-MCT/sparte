from django.conf import settings
from django.http import HttpResponsePermanentRedirect
from django.views.generic import DetailView

from public_data.models import AdminRef
from public_data.models.administration import LandModel


class DiagnosticBaseView(DetailView):
    context_object_name = "land"
    model = LandModel
    page_section = ""

    def get_land_id_from_slug(self) -> str:
        """Extract land_id from slug. Format: '{land_id}-{slugified-name}'.
        Special case: 'france' maps to NATION."""
        land_slug = self.kwargs["land_slug"]
        if land_slug == "france":
            return "NATION"
        return land_slug.split("-", 1)[0]

    def get_object(self, queryset=None):
        land_type = AdminRef.slug_to_code(self.kwargs["land_type"])
        land_id = self.get_land_id_from_slug()
        return LandModel.objects.get(
            land_type=land_type,
            land_id=land_id,
        )

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        land_slug = self.kwargs["land_slug"]
        if land_slug != self.object.slug:
            land_type = self.kwargs["land_type"]
            prefix = f"/diagnostic/{land_type}/{land_slug}"
            prefix_len = len(prefix)
            suffix = request.path[prefix_len:]
            return HttpResponsePermanentRedirect(f"/diagnostic/{land_type}/{self.object.slug}{suffix}")
        context = self.get_context_data(object=self.object)
        return self.render_to_response(context)

    def get_page_title(self, land: LandModel) -> str:
        land_type_label = AdminRef.get_label(land.land_type)
        territory = f"{land.name} ({land.land_id})"
        if self.page_section:
            return f"{self.page_section} - {territory} | Mon Diag Artif"
        return f"Diagnostic {land_type_label} {territory} | Mon Diag Artif"

    def get_meta_description(self, land: LandModel) -> str:
        land_type_label = AdminRef.get_label(land.land_type).lower()
        base = f"Diagnostic d'artificialisation des sols de la {land_type_label} {land.name} ({land.land_id})"
        if self.page_section:
            return f"{base} - {self.page_section}."
        return f"{base} : consommation d'espaces, artificialisation, trajectoire ZAN."

    def get_og_title(self, land: LandModel) -> str:
        """Titre Open Graph pour le partage"""
        return f"Diagnostic de {land.name} | Mon Diagnostic Artificialisation"

    def get_og_description(self, land: LandModel) -> str:
        """Description Open Graph pour le partage"""
        return f"Consultez les données d'artificialisation et de consommation d'espaces du territoire de {land.name}."

    def get_context_data(self, **kwargs):
        land = self.object
        page_title = self.get_page_title(land)
        meta_description = self.get_meta_description(land)
        canonical_url = self.request.build_absolute_uri(self.request.path)

        kwargs.update(
            {
                "HIGHCHART_SERVER": settings.HIGHCHART_SERVER,
                "page_title": page_title,
                "meta_description": meta_description,
                "canonical_url": canonical_url,
                "og_title": self.get_og_title(land),
                "og_description": self.get_og_description(land),
                "og_url": canonical_url,
            }
        )
        return super().get_context_data(**kwargs)
