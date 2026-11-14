"""
Extrait les données d'un seul territoire pour la fixture des tests end-to-end.

Les tables `public_data` non gérées par Django (construites par dbt / Airflow)
sont filtrées sur un territoire et sérialisées au format fixture Django, pour
être rechargées en CI par `e2e_setup_db`.

Exemple (depuis le conteneur Django, en lecture seule sur la base) :

    docker compose exec django python manage.py e2e_dump_land \
        --land-type COMM --land-id 69123 \
        --output public_data/fixtures/e2e/land_COMM_69123.json
"""

import sys
from itertools import chain

from django.apps import apps
from django.core import serializers
from django.core.management.base import BaseCommand, CommandError

from public_data.models import LandModel

# Tables exclues de la fixture (elles sont créées vides en CI) :
# - LandCarroyageBounds et BivariateLandRate : plusieurs centaines de lignes par
#   commune, inutiles au parcours testé ;
# - NearestTerritories : référence des territoires voisins absents de la fixture ;
# - ImperZonage : le schéma de la base locale diverge du modèle Django.
EXCLUDED_MODELS = {
    "LandCarroyageBounds",
    "BivariateLandRate",
    "NearestTerritories",
    "ImperZonage",
}


def unmanaged_public_data_models():
    """Modèles `public_data` non gérés par Django, LandModel en premier."""
    models = [
        model
        for model in apps.get_app_config("public_data").get_models()
        if not model._meta.managed and model is not LandModel
    ]
    return [LandModel] + sorted(models, key=lambda model: model.__name__)


def fixture_models():
    """Modèles dont les lignes du territoire sont extraites dans la fixture."""
    return [
        model
        for model in unmanaged_public_data_models()
        if model.__name__ not in EXCLUDED_MODELS
        and {"land_id", "land_type"} <= {field.name for field in model._meta.get_fields()}
    ]


def dump_land(land_type: str, land_id: str) -> str:
    if not LandModel.objects.filter(land_type=land_type, land_id=land_id).exists():
        raise CommandError(f"Territoire introuvable : {land_type} {land_id}")

    querysets = [
        model.objects.filter(land_type=land_type, land_id=land_id).order_by("pk") for model in fixture_models()
    ]
    return serializers.serialize("json", chain.from_iterable(querysets), indent=2)


class Command(BaseCommand):
    help = "Extrait les données d'un territoire au format fixture Django (tests e2e)."

    def add_arguments(self, parser):
        parser.add_argument("--land-type", default="COMM", help="Type de territoire (code, ex. COMM)")
        parser.add_argument("--land-id", default="69123", help="Identifiant du territoire (ex. code INSEE)")
        parser.add_argument("--output", help="Fichier de sortie (défaut : sortie standard)")

    def handle(self, *args, **options):
        content = dump_land(options["land_type"], options["land_id"])
        if options["output"]:
            with open(options["output"], "w", encoding="utf-8") as output:
                output.write(content + "\n")
            self.stderr.write(f"Fixture écrite dans {options['output']}")
        else:
            sys.stdout.write(content + "\n")
