import logging
import pandas as pd

from django.contrib.gis.db.models import Union
from django.core.management.base import BaseCommand
from django.db import connection

from public_data.models import Scot, Region, Departement, Commune, Cerema
from public_data.storages import DataStorage
from utils.db import fix_poly


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Charge les SCoTs"

    def init_data(self):
        self.scot_id_list = list()
        self.region_list = {r.name: r for r in Region.objects.all()} | {
            "Bourgogne-Franche-Comte": Region.objects.get(
                name="Bourgogne-Franche-Comté"
            ),
            "Ile-de-France": Region.objects.get(name="Île-de-France"),
            "Auvergne-Rhone-Alpes": Region.objects.get(name="Auvergne-Rhône-Alpes"),
            "Provence-Alpes-Cote d'Azur": Region.objects.get(
                name="Provence-Alpes-Côte d'Azur"
            ),
        }
        self.dept_list = {d.name: d for d in Departement.objects.all()}
        with DataStorage().open("scote_et_communes.xlsx") as file_stream:
            self.df_scot = pd.read_excel(file_stream, sheet_name="Liste des SCoT")
            self.df_city = pd.read_excel(file_stream, sheet_name="Communes Scot")

    def handle(self, *args, **options):
        logger.info("Start loading SCoTs")
        self.init_data()
        self.create_or_update_scot()
        self.link_commune_to_scot()
        self.calculate_scot_mpoly_field()
        self.update_cerema()
        logger.info("End loading SCoTs")

    def create_or_update_scot(self):
        for _, row in self.df_scot.iterrows():

            def replace_nat(item):
                if not pd.isnull(item):
                    return item
                return None

            if row["Région"] not in self.region_list:
                # ignore DOMTOM
                continue
            try:
                scot = Scot.objects.get(id=row["IDSCoT\n"])
            except Scot.DoesNotExist:
                scot = Scot(id=row["IDSCoT\n"])
            scot.name = row["Nom"]
            scot.region = self.region_list[row["Région"]]
            scot.departement = self.dept_list[row["Département"]]
            scot.is_inter_departement = row["interdépartemental (Oui/non)"] == "Oui"
            scot.state_statut = row["Libellé Etat simplifié"]
            scot.detailed_state_statut = row["Libellé Etat détaillé\n"]
            scot.date_published_perimeter = replace_nat(row["publication du Pèrimetre"])
            scot.date_acting = replace_nat(row["engagement"])
            scot.date_stop = replace_nat(row["Arrêt de projet"])
            scot.date_validation = replace_nat(row["approbation"])
            scot.date_end = replace_nat(row["Fin échéance"])
            scot.is_ene_law = row["Intégration disposition loi ENE"] == "Oui"
            scot.scot_type = row["Type"]
            scot.siren = row["Siren"]
            try:
                scot.save()
            except ValueError as e:
                print(e)
            self.scot_id_list.append(scot.id)

    def link_commune_to_scot(self):
        logger.info("link_commune_to_scot")
        for _, row in self.df_city.iterrows():
            try:
                if row["id"] in self.scot_id_list:
                    # keep only cities in keeped SCoT (ie. remove islands)
                    city = Commune.objects.get(insee=row["insee"])
                    city.scot_id = row["id"]
                    city.save()
            except Commune.DoesNotExist:
                logger.error("%s insee is unknown in commune", row["insee"])

    def calculate_scot_mpoly_field(self):
        logger.info("calculate_scot_mpoly_field")
        qs = Commune.objects.values("scot__id").annotate(union_mpoly=Union("mpoly"))
        for row in qs:
            scot_mpoly = fix_poly(row["union_mpoly"])
            Scot.objects.filter(id=row["scot__id"]).update(mpoly=scot_mpoly)

    def update_cerema(self):
        """Update Cerema's scot field with correct name accordingly of what we have done
        before"""
        Cerema.objects.all().update(scot=None)
        query = """
            UPDATE public_data_cerema c
            SET scot = t.scot
            FROM (
            SELECT pc.insee AS city_insee, ps.name AS scot
            FROM public_data_scot ps
            INNER JOIN public_data_commune pc ON ps.id = pc.scot_id
            ) t
            WHERE c.city_insee = t.city_insee;
        """
        with connection.cursor() as cursor:
            cursor.execute(query)
