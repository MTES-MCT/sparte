import logging

from django.contrib.gis.db.models import Union
from django.core.management.base import BaseCommand
from project.models.project_base import ProjectCommune

from public_data.models import Commune, Cerema, Epci
from public_data.models.administration import Departement, Region, Scot
from public_data.models.ocsge import ArtificialArea
from utils.commands import PrintProgress
from utils.db import fix_poly


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Update administration level with CEREMA's data"

    def handle(self, *args, **options):
        PrintProgress.logger = logger
        logger.info(self.help)
        self.update_region()
        self.update_departement()
        self.update_scot()
        self.update_epci()
        self.update_commune()
        self.delete_commune()

    def update_region(self):
        region_list = Cerema.objects.all().values("region_id", "region_name").annotate(geom=Union("mpoly"))
        for region in PrintProgress(region_list, title="looping on regions", step=4):
            Region.objects.filter(source_id=region["region_id"]).update(
                name=region["region_name"],
                mpoly=fix_poly(region["geom"]),
            )

    def update_departement(self):
        dept_list = Cerema.objects.all().values("dept_id", "dept_name").annotate(geom=Union("mpoly"))
        for dept in PrintProgress(dept_list, title="looping on departements"):
            Departement.objects.filter(source_id=dept["dept_id"]).update(
                name=dept["dept_name"],
                mpoly=fix_poly(dept["geom"]),
            )

    def update_scot(self):
        Commune.objects.all().update(scot=None)
        Scot.objects.all().delete()
        new_scot_list = (
            Cerema.objects.all()
            .exclude(scot__isnull=True)
            .exclude(scot="")
            .values("scot")
            .annotate(geom=Union("mpoly"))
        )
        for new_scot in PrintProgress(new_scot_list, title="looping on SCoT"):
            scot = Scot.objects.create(
                name=new_scot["scot"],
                mpoly=fix_poly(new_scot["geom"]),
            )
            scot.departements.set(
                Departement.objects.filter(
                    source_id__in=Cerema.objects.filter(scot=new_scot["scot"])
                    .values_list("dept_id", flat=True)
                    .distinct()
                )
            )
            scot.regions.set(
                Region.objects.filter(
                    source_id__in=Cerema.objects.filter(scot=new_scot["scot"])
                    .values_list("region_id", flat=True)
                    .distinct()
                )
            )

    def update_epci(self):
        new_epci_list = Cerema.objects.all().values("epci_id", "epci_name").annotate(geom=Union("mpoly"))
        old_epci = {e.source_id: e for e in Epci.objects.all()}
        for new_epci in PrintProgress(new_epci_list, title="looping on EPCI"):
            epci = old_epci.pop(new_epci["epci_id"], None)
            if epci:
                epci.name = new_epci["epci_name"]
                epci.mpoly = fix_poly(new_epci["geom"])
                epci.save()
            else:
                epci = Epci.objects.create(
                    source_id=new_epci["epci_id"],
                    name=new_epci["epci_name"],
                    mpoly=fix_poly(new_epci["geom"]),
                )
                epci.departements.set(Departement.objects.intersect(new_epci["geom"]))
        for epci in old_epci.values():
            epci.commune_set.all().update(epci=None)
            epci.delete()

    def update_commune(self):
        cerema_city_list = Cerema.objects.all()
        for cerema_city in PrintProgress(cerema_city_list, title="looping on communes", step=1000):
            epci = Epci.objects.get(source_id=cerema_city.epci_id)
            scot = Scot.objects.get(name=cerema_city.scot) if cerema_city.scot else None
            try:
                commune = Commune.objects.get(insee=cerema_city.city_insee)
                commune.epci = epci
                commune.scot = scot
                commune.mpoly = cerema_city.mpoly
                commune.save()
            except Commune.DoesNotExist:
                commune = Commune.objects.create(
                    insee=cerema_city.city_insee,
                    name=cerema_city.city_name,
                    departement=Departement.objects.get(source_id=cerema_city.dept_id),
                    epci=epci,
                    scot=scot,
                    mpoly=cerema_city.mpoly,
                )

    def delete_commune(self):
        to_delete = Commune.objects.exclude(insee__in=Cerema.objects.all().values_list("city_insee", flat=True))
        ProjectCommune.objects.filter(commune__in=to_delete).delete()
        ArtificialArea.objects.filter(city__in=to_delete).delete()
        to_delete.delete()
