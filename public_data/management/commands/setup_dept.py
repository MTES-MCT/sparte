import logging

from django.core.management.base import BaseCommand

from public_data.models import Commune, Departement

logger = logging.getLogger("management.commands")

config = {
    "Gers": [2016, 2019],
    "Essonne": [2018, 2021],
    "Seine-et-Marne": [2017, 2021],
    "Hauts-de-Seine": [2018, 2021],
    "Landes": [2018, 2021],
}


class Command(BaseCommand):
    help = "Will go through all departements and set available millesimes for each"

    def handle(self, *args, **options):
        logger.info("Start setup departement OCSGE")
        Departement.objects.all().update(
            is_artif_ready=False,
            ocsge_millesimes=None,
        )
        Commune.objects.all().update(
            first_millesime=None,
            last_millesime=None,
            ocsge_available=False,
        )
        logger.info("Done reset, start config")

        for name, millesimes in config.items():
            dept = Departement.objects.get(name=name)
            dept.is_artif_ready = True
            dept.ocsge_millesimes = millesimes
            dept.save()

            Commune.objects.filter(departement=dept).update(
                first_millesime=min(millesimes),
                last_millesime=max(millesimes),
                ocsge_available=True,
            )

            logger.info(f"Done {name}: {millesimes}")

        qte = Departement.objects.filter(is_artif_ready=True).count()
        if qte == len(config):
            logger.info("%d departement is artif ready", qte)
        else:
            logger.error("%d departement with artif ready instead of %d", qte, len(config))
