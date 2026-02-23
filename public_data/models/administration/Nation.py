from django.apps import apps

from .AdminRef import AdminRef


class Nation:
    """
    Ce modèle copie le format des autres modèles de territoire pour les nations,
    et est utilisé comme niveau de comparison pour les régions.
    """

    source_id = "NATION"
    name = "France"

    land_type = AdminRef.NATION
    land_type_label = "Nation"
    default_analysis_level = AdminRef.REGION

    @property
    def official_id(self) -> str:
        return self.source_id

    def get_cities(self):
        Commune = apps.get_model("public_data.Commune")
        return Commune.objects.all()

    def get_departements(self):
        Departement = apps.get_model("public_data.Departement")
        return [dept.source_id for dept in Departement.objects.all()]

    @classmethod
    def search(cls, *args, **kwargs):
        return []

    def __str__(self):
        return self.name
