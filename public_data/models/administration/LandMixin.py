from django.utils.functional import cached_property

from .AdminRef import AdminRef
from .enums import ConsommationCorrectionStatus


class LandMixin:
    """Interface to work seemlessly with all administration's level."""

    @cached_property
    def public_key(self):
        return f"{self.land_type}_{self.official_id}"

    @cached_property
    def area(self) -> float:
        """Return surface of the land in Ha"""
        return float(self.mpoly.transform(self.srid_source, clone=True).area / 10000)

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        raise NotImplementedError("need to be overridden")

    def get_official_id(self) -> str:
        return self.source_id if self.source_id is not None else ""

    @property
    def consommation_correction_status(self) -> str:
        """
        Dans le cas des communes, le statut de correction des données de consommation
        est la valeur directement attachée aux objets Commune, issu des transformations
        effectuées sur Airflow.

        Dans les autres cas, on retourne arbitrairement la valeur UNCHANGED, puisque que
        nous ne différencions pas les statuts de correction des données de consommation
        pour les autres types de territoires, même si une commune n'ayant pas la valeur
        UNCHANGED est incluse dans le territoire.

        La raison de ce choix est que la différence potentielle du total de consommation
        entre les données de consommation et les données de consommation corrigées est
        négligeable pour les autres types de territoires.

        Pour plus d'informations sur la définition de chacun des statuts, voir les
        commentaires de la classe ConsommationCorrectionStatus.
        """
        if self.land_type == AdminRef.COMMUNE:
            return self.consommation_correction_status

        return ConsommationCorrectionStatus.UNCHANGED

    def get_cities(self):
        raise NotImplementedError("need to be overridden")

    @property
    def official_id(self) -> str:
        raise NotImplementedError("need to be overridden")
