import logging

from django.core.management.base import BaseCommand

from public_data.models import Departement


logger = logging.getLogger("management.commands")

config = {
    "Gers": "2016 2019",
    "Gironde": "2015 2018",
    "Côte-d'or": "2010 2017",
    "Doubs": "2010 2017",
    "Jura": "2010 2017",
    "Nièvre": "2011 2017",
    "Haute-Saône": "2011 2017",
    "Saône-et-Loire": "2011 2018",
    "Yonne": "2011 2018",
    "Territoire de Belfort": "2010 2017",
}


class Command(BaseCommand):
    help = "Will go through all departements and set available millesimes for each"

    def handle(self, *args, **options):
        logger.info("Start setup departement OCSGE")
        Departement.objects.all().update(
            is_artif_ready=False,
            ocsge_millesimes="",
        )
        logger.info("Done reset, start config")
        for name, millesimes in config.items():
            Departement.objects.filter(name=name).update(
                is_artif_ready=True,
                ocsge_millesimes=millesimes,
            )
            logger.info(f"Done {name}: {millesimes}")
        logger.info("End setup departement OCSGE")
