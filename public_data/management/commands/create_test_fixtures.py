import json

from django.core.management.base import BaseCommand
from django.core.serializers import serialize

from public_data.models import (
    ArtifZonage,
    ArtifZonageIndex,
    AutorisationLogement,
    ImperZonage,
    ImperZonageIndex,
    LandArtifFlux,
    LandArtifFluxCouvertureComposition,
    LandArtifFluxCouvertureCompositionIndex,
    LandArtifFluxIndex,
    LandArtifFluxUsageComposition,
    LandArtifFluxUsageCompositionIndex,
    LandArtifStock,
    LandArtifStockCouvertureComposition,
    LandArtifStockCouvertureCompositionIndex,
    LandArtifStockIndex,
    LandArtifStockUsageComposition,
    LandArtifStockUsageCompositionIndex,
    LandConso,
    LandConsoComparison,
    LandConsoStats,
    LandFriche,
    LandFricheGeojson,
    LandFrichePollution,
    LandFricheStatut,
    LandFricheSurfaceRank,
    LandFricheType,
    LandFricheZonageEnvironnementale,
    LandFricheZonageType,
    LandFricheZoneActivite,
    LandImperFlux,
    LandImperFluxCouvertureComposition,
    LandImperFluxCouvertureCompositionIndex,
    LandImperFluxIndex,
    LandImperFluxUsageComposition,
    LandImperFluxUsageCompositionIndex,
    LandImperStock,
    LandImperStockCouvertureComposition,
    LandImperStockCouvertureCompositionIndex,
    LandImperStockIndex,
    LandImperStockUsageComposition,
    LandImperStockUsageCompositionIndex,
    LandModel,
    LandPop,
    LandPopStats,
    LogementVacant,
    NearestTerritories,
)
from public_data.models.administration.LandGeoJSON import LandGeoJSON
from public_data.models.bivariate import (
    BivariateConsoThreshold,
    BivariateIndicThreshold,
    BivariateLandRate,
)
from public_data.models.dossier_complet import (
    LandDcActiviteChomage,
    LandDcCategoriesSocioprofessionnelles,
    LandDcCreationsEntreprises,
    LandDcEquipementsBpe,
    LandDcLogement,
    LandDcMenages,
    LandDcPopulation,
    LandDcRevenusPauvrete,
    LandDcTourisme,
)

LAND_MODELS = [
    LandConso,
    LandConsoComparison,
    LandConsoStats,
    LandPop,
    LandPopStats,
    NearestTerritories,
    ArtifZonage,
    ArtifZonageIndex,
    LandArtifStock,
    LandArtifStockIndex,
    LandArtifStockCouvertureComposition,
    LandArtifStockCouvertureCompositionIndex,
    LandArtifStockUsageComposition,
    LandArtifStockUsageCompositionIndex,
    LandArtifFlux,
    LandArtifFluxIndex,
    LandArtifFluxCouvertureComposition,
    LandArtifFluxCouvertureCompositionIndex,
    LandArtifFluxUsageComposition,
    LandArtifFluxUsageCompositionIndex,
    ImperZonage,
    ImperZonageIndex,
    LandImperStock,
    LandImperStockIndex,
    LandImperStockCouvertureComposition,
    LandImperStockCouvertureCompositionIndex,
    LandImperStockUsageComposition,
    LandImperStockUsageCompositionIndex,
    LandImperFlux,
    LandImperFluxIndex,
    LandImperFluxCouvertureComposition,
    LandImperFluxCouvertureCompositionIndex,
    LandImperFluxUsageComposition,
    LandImperFluxUsageCompositionIndex,
    LandFriche,
    LandFricheGeojson,
    LandFrichePollution,
    LandFricheStatut,
    LandFricheSurfaceRank,
    LandFricheType,
    LandFricheZonageEnvironnementale,
    LandFricheZonageType,
    LandFricheZoneActivite,
    AutorisationLogement,
    LogementVacant,
    LandDcPopulation,
    LandDcLogement,
    LandDcMenages,
    LandDcActiviteChomage,
    LandDcCreationsEntreprises,
    LandDcCategoriesSocioprofessionnelles,
    LandDcEquipementsBpe,
    LandDcRevenusPauvrete,
    LandDcTourisme,
    BivariateLandRate,
    LandGeoJSON,
]

# Modèles globaux (pas de filtre land_id/land_type)
GLOBAL_MODELS = [
    BivariateConsoThreshold,
    BivariateIndicThreshold,
]


class Command(BaseCommand):
    help = "Crée des fixtures de test en filtrant les données par département."

    def add_arguments(self, parser):
        parser.add_argument(
            "--departement",
            default="75",
            help="Code du département à extraire (défaut: 75 = Paris)",
        )
        parser.add_argument(
            "--output",
            default="public_data/fixtures/test_data.json",
            help="Chemin du fichier de sortie",
        )

    def handle(self, *args, **options):
        dept_code = options["departement"]
        output_path = options["output"]
        dept_key = f"DEPART_{dept_code}"

        # 1. Récupérer le département + tous ses enfants
        dept = LandModel.objects.filter(key=dept_key).first()
        if not dept:
            self.stderr.write(f"Département {dept_code} introuvable.")
            return

        children = LandModel.objects.filter(parent_keys__contains=[dept_key])
        all_lands = LandModel.objects.filter(key=dept_key) | children
        land_pairs = set(all_lands.values_list("land_id", "land_type"))

        self.stdout.write(f"Département: {dept.name} ({dept_key})")
        self.stdout.write(f"Territoires trouvés: {len(land_pairs)}")

        # 2. Sérialiser LandModel (sans geom pour alléger)
        all_objects = []
        land_data = json.loads(serialize("json", all_lands))
        all_objects.extend(land_data)
        self.stdout.write(f"  LandModel: {len(land_data)} objets")

        # 3. Sérialiser les tables liées
        for model in LAND_MODELS:
            qs = model.objects.none()
            for land_id, land_type in land_pairs:
                qs = qs | model.objects.filter(land_id=land_id, land_type=land_type)

            count = qs.count()
            if count > 0:
                model_data = json.loads(serialize("json", qs))
                all_objects.extend(model_data)
            self.stdout.write(f"  {model.__name__}: {count} objets")

        # 4. Sérialiser les tables globales (sans filtre land_id)
        for model in GLOBAL_MODELS:
            qs = model.objects.all()
            count = qs.count()
            if count > 0:
                model_data = json.loads(serialize("json", qs))
                all_objects.extend(model_data)
            self.stdout.write(f"  {model.__name__}: {count} objets")

        # 5. Écrire le fichier
        with open(output_path, "w") as f:
            json.dump(all_objects, f, indent=2, ensure_ascii=False)

        self.stdout.write(self.style.SUCCESS(f"\nFixtures écrites dans {output_path} ({len(all_objects)} objets)"))
