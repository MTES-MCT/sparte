from logging import getLogger

from django.db.models import F, Q
from django.db.models.query import QuerySet

from public_data.models import CommuneDiff, OcsgeDiff
from public_data.models.administration import Commune
from utils.db import cast_sum_area

logger = getLogger(__name__)


class CalculateCommuneDiff:
    @staticmethod
    def execute(commune: Commune) -> QuerySet[CommuneDiff]:
        qs = (
            OcsgeDiff.objects.intersect(commune.mpoly)
            .filter(departement=commune.departement.source_id)
            .values("year_old", "year_new")
            .annotate(
                new_artif=cast_sum_area("intersection_area", filter=Q(is_new_artif=True)),
                new_natural=cast_sum_area("intersection_area", filter=Q(is_new_natural=True)),
                net_artif=F("new_artif") - F("new_natural"),
            )
        )
        CommuneDiff.objects.filter(city=commune).delete()
        CommuneDiff.objects.bulk_create([CommuneDiff(city=commune, **_) for _ in qs])
        return CommuneDiff.objects.filter(city=commune)
