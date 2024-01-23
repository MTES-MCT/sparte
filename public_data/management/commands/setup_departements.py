import logging

from django.core.management.base import BaseCommand

from public_data.models import Commune, DataSource, Departement

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = """Setup departements and communes OCSGE properties
    - Reset departements and communes OCSGE properties
    - Compute OCSGE millesimes for departements
    - Compute first and last millesimes for communes
    """

    def reset_departements_and_communes(self):
        Departement.objects.all().update(
            is_artif_ready=False,
            ocsge_millesimes=None,
        )
        Commune.objects.all().update(
            first_millesime=None,
            last_millesime=None,
            ocsge_available=False,
        )

    def handle(self, *args, **options):
        logger.info("Start setup departements OCSGE")
        self.reset_departements_and_communes()
        logger.info("Departements and communes OCSGE properties resetted")

        sources = DataSource.objects.filter(
            productor=DataSource.ProductorChoices.IGN,
            dataset=DataSource.DatasetChoices.OCSGE,
        )

        logger.info(f"{sources.count()} OCSGE sources found")

        departements_with_ocsge = Departement.objects.filter(
            source_id__in=sources.values_list("official_land_id", flat=True)
        ).distinct()

        logger.info(f"{departements_with_ocsge.count()} departement with OCSGE found")

        for departement in departements_with_ocsge:
            millesimes = set()
            for source in sources.filter(official_land_id=departement.source_id):
                millesimes.update(source.millesimes)

            departement.ocsge_millesimes = sorted(list(millesimes))
            departement.is_artif_ready = True
            departement.save()

            Commune.objects.filter(departement=departement).update(
                first_millesime=min(departement.ocsge_millesimes),
                last_millesime=max(departement.ocsge_millesimes),
                ocsge_available=True,
            )

            logger.info(f"Done {departement.name}: {departement.ocsge_millesimes}")

        logger.info(msg="End setup departements OCSGE")
