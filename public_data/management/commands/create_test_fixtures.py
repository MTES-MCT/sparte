import gzip
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
    help = "Crée des fixtures de test en filtrant les données par EPCI."

    def add_arguments(self, parser):
        parser.add_argument(
            "--epci",
            default="200046977",
            help="Code SIREN de l'EPCI à extraire (défaut: 200046977)",
        )
        parser.add_argument(
            "--output",
            default="public_data/fixtures/test_data.json.gz",
            help="Chemin du fichier de sortie",
        )

    def handle(self, *args, **options):
        epci_code = options["epci"]
        output_path = options["output"]
        epci_key = f"EPCI_{epci_code}"

        all_lands, land_pairs = self.get_lands(epci_key, epci_code)
        if all_lands is None:
            return

        all_objects = []
        all_objects.extend(self.serialize_land_territories(all_lands))
        all_objects.extend(self.serialize_land_models(land_pairs))
        all_objects.extend(self.serialize_global_models())
        self.write_fixtures(output_path, all_objects)

    def get_lands(self, epci_key, epci_code):
        """Récupère l'EPCI et tous ses territoires enfants (communes)."""
        epci = LandModel.objects.filter(key=epci_key).first()
        if not epci:
            self.stderr.write(f"EPCI {epci_code} introuvable.")
            return None, None

        children = LandModel.objects.filter(parent_keys__contains=[epci_key])
        all_lands = LandModel.objects.filter(key=epci_key) | children
        land_pairs = set(all_lands.values_list("land_id", "land_type"))

        self.stdout.write(f"EPCI: {epci.name} ({epci_key})")
        self.stdout.write(f"Territoires trouvés: {len(land_pairs)}")
        return all_lands, land_pairs

    @staticmethod
    def simplify_land_geometries(land_data):
        """Remplace les géométries de LandModel par un simple carré."""
        simple_geom = "SRID=4326;MULTIPOLYGON (((4.8 45.7, 4.9 45.7, 4.9 45.8, 4.8 45.8, 4.8 45.7)))"
        for item in land_data:
            fields = item.get("fields", {})
            for key in ["geom", "simple_geom"]:
                if key in fields and fields[key]:
                    fields[key] = simple_geom

    def serialize_land_territories(self, all_lands):
        """Sérialise les objets LandModel (EPCI + communes) avec géométries simplifiées."""
        land_data = json.loads(serialize("json", all_lands))
        self.simplify_land_geometries(land_data)
        self.stdout.write(f"  LandModel: {len(land_data)} objets")
        return land_data

    @staticmethod
    def simplify_geojson(objects):
        """Simplifie les géométries dans les objets LandGeoJSON."""
        simple_coords = [
            [
                [540000.0, 5730000.0],
                [541000.0, 5730000.0],
                [541000.0, 5731000.0],
                [540000.0, 5731000.0],
                [540000.0, 5730000.0],
            ]
        ]
        for item in objects:
            if item.get("model") != "public_data.landgeojson":
                continue
            geojson = item.get("fields", {}).get("geojson")
            if not isinstance(geojson, dict):
                continue
            for feat in geojson.get("features", []):
                geom = feat.get("geometry", {})
                if "coordinates" in geom:
                    geom["coordinates"] = simple_coords

    def serialize_land_models(self, land_pairs):
        """Sérialise les données thématiques (conso, artif, friches...) liées aux territoires."""
        objects = []
        for model in LAND_MODELS:
            qs = model.objects.none()
            for land_id, land_type in land_pairs:
                qs = qs | model.objects.filter(land_id=land_id, land_type=land_type)

            count = qs.count()
            if count > 0:
                objects.extend(json.loads(serialize("json", qs)))
            self.stdout.write(f"  {model.__name__}: {count} objets")
        self.simplify_geojson(objects)
        return objects

    def serialize_global_models(self):
        """Sérialise les tables de référence globales (seuils bivariés)."""
        objects = []
        for model in GLOBAL_MODELS:
            qs = model.objects.all()
            count = qs.count()
            if count > 0:
                objects.extend(json.loads(serialize("json", qs)))
            self.stdout.write(f"  {model.__name__}: {count} objets")
        return objects

    def write_fixtures(self, output_path, all_objects):
        """Écrit toutes les données sérialisées dans le fichier JSON gzippé."""
        with gzip.open(output_path, "wt", encoding="utf-8") as f:
            json.dump(all_objects, f, ensure_ascii=False)
        self.stdout.write(self.style.SUCCESS(f"\nFixtures écrites dans {output_path} ({len(all_objects)} objets)"))
