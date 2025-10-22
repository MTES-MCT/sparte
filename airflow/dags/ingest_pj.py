"""
DAG pour ingérer les fichiers PJ (Périmètres de Juridiction) par département et année.

Ce DAG lit un fichier de configuration JSON contenant les URLs des fichiers GeoPackage,
télécharge chaque fichier en parallèle, normalise les données en ajoutant le département
et l'année, puis ingère dans PostgreSQL.

Architecture :
- load_config() : Charge la configuration et crée une liste de tâches
- ingest_single_file() : Ingère un fichier (exécuté en parallèle via task mapping)
- generate_report() : Agrège les résultats et génère un rapport final

Gestion des fichiers temporaires :
Chaque tâche parallèle utilise son propre répertoire temporaire unique (via tempfile.mkdtemp())
pour éviter les conflits lors de l'extraction des fichiers compressés.
"""

import json
from pathlib import Path
from typing import Any

from include.container import DomainContainer, InfraContainer
from pendulum import datetime

from airflow.decorators import dag, task

# Chemin vers le fichier de configuration JSON
CONFIG_FILE = Path(__file__).parent.parent / "include" / "data" / "ocsge" / "pj_sources.json"


def print_ingestion_report(successes: list[dict[str, Any]], errors: list[dict[str, Any]]) -> None:
    """
    Affiche un rapport détaillé de l'ingestion.

    Args:
        successes: Liste des fichiers ingérés avec succès
        errors: Liste des fichiers en erreur avec détails
    """
    total = len(successes) + len(errors)
    success_rate = (len(successes) / total * 100) if total > 0 else 0

    # En-tête
    separator = "=" * 80
    print(f"\n{separator}")
    print("RAPPORT D'INGESTION")
    print(separator)

    # Statistiques globales
    print("\nStatistiques :")
    print(f"  • Total de fichiers traités : {total}")
    print(f"  • Succès : {len(successes)} ({success_rate:.1f}%)")
    print(f"  • Erreurs : {len(errors)} ({100 - success_rate:.1f}%)")

    # Détails des succès
    if successes:
        print(f"\n✓ Fichiers ingérés avec succès ({len(successes)}) :")
        for s in successes:
            file_padded = f"{s['file']:30}"
            dept_padded = f"{s['departement']:3}"
            print(f"  • {file_padded} (dept {dept_padded}, année {s['annee']})")

    # Détails des erreurs
    if errors:
        print(f"\n✗ Fichiers en erreur ({len(errors)}) :")
        for e in errors:
            dept_annee = f"dept {e['departement']}, année {e['annee']}"
            print(f"  • {e['file']:30} ({dept_annee})")
            print(f"    └─ {e['error']}")

    print(f"\n{separator}\n")


def build_report(successes: list[dict[str, Any]], errors: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Construit le rapport d'ingestion et lève une exception si tous les fichiers ont échoué.

    Args:
        successes: Liste des fichiers ingérés avec succès
        errors: Liste des fichiers en erreur

    Returns:
        Dictionnaire contenant le rapport complet

    Raises:
        RuntimeError: Si tous les fichiers ont échoué
    """
    report = {
        "total": len(successes) + len(errors),
        "successes": successes,
        "errors": errors,
        "success_rate": (len(successes) / (len(successes) + len(errors)) * 100)
        if (len(successes) + len(errors)) > 0
        else 0,
    }

    # Lever une exception si TOUT a échoué
    if len(successes) == 0 and len(errors) > 0:
        raise RuntimeError(f"Tous les fichiers ont échoué ({len(errors)} erreurs)")

    return report


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["PJ", "Ingest"],
)
def ingest_pj():
    """Ingère les fichiers PJ depuis le fichier de configuration JSON."""

    bucket_name = InfraContainer().bucket_name()
    table_name = "ocsge_parc_et_jardins"

    @task.python
    def load_config() -> list[dict[str, Any]]:
        """
        Charge le fichier de configuration JSON et le transforme en liste de tâches.

        Returns:
            Liste de dictionnaires, chacun représentant un fichier à ingérer
        """
        with open(CONFIG_FILE) as f:
            config = json.load(f)

        # Transformer en liste plate de tâches pour le mapping
        tasks = []
        for departement, annees in config.items():
            for annee, url in annees.items():
                tasks.append(
                    {
                        "departement": departement,
                        "annee": annee,
                        "url": url,
                    }
                )

        return tasks

    @task.python
    def ingest_single_file(task_config: dict[str, Any]) -> dict[str, Any]:
        """
        Ingère un seul fichier GeoPackage.

        Args:
            task_config: Configuration pour un fichier (departement, annee, url)

        Returns:
            Résultat de l'ingestion (succès ou erreur)
        """
        departement = task_config["departement"]
        annee = task_config["annee"]
        url = task_config["url"]

        filename_7z = f"PJ_{departement}_{annee}.7z"
        filename_gpkg = f"PJ_{departement}_{annee}.gpkg"

        handler = DomainContainer().compressed_remote_geopackage_to_db_handler()

        try:
            print(f"Traitement de {departement} - {annee}...")

            # Le handler utilise tempfile.mkdtemp() donc pas de conflit entre tâches parallèles
            handler.download_extract_and_ingest(
                url=url,
                table_name=table_name,
                s3_bucket=bucket_name,
                s3_key_compressed=f"pj/{filename_7z}",
                s3_key_extracted=f"pj/{filename_gpkg}",
                extra_columns={"departement": departement, "annee": annee},
                mode="append",
            )

            print(f"✓ {filename_gpkg} ingéré avec succès")
            return {
                "status": "success",
                "file": filename_gpkg,
                "departement": departement,
                "annee": annee,
            }

        except Exception as e:
            print(f"✗ Erreur lors du traitement de {departement} - {annee}: {e}")
            return {
                "status": "error",
                "file": filename_gpkg,
                "departement": departement,
                "annee": annee,
                "error": str(e),
                "details": str(type(e).__name__),
            }

    @task.python
    def generate_report(results: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Génère un rapport à partir des résultats de toutes les ingestions parallèles.

        Args:
            results: Liste des résultats de chaque ingestion

        Returns:
            Rapport agrégé avec succès et erreurs
        """
        successes = []
        errors = []

        # Séparer les succès des erreurs
        for result in results:
            if result["status"] == "success":
                successes.append(
                    {
                        "file": result["file"],
                        "departement": result["departement"],
                        "annee": result["annee"],
                    }
                )
            else:
                errors.append(
                    {
                        "file": result["file"],
                        "departement": result["departement"],
                        "annee": result["annee"],
                        "error": result["error"],
                        "details": result["details"],
                    }
                )

        # Afficher et retourner le rapport
        print_ingestion_report(successes, errors)
        return build_report(successes, errors)

    # Définir le flux de tâches avec parallélisation
    tasks = load_config()

    # Utiliser expand() pour créer une tâche par fichier (exécution en parallèle)
    ingestion_results = ingest_single_file.expand(task_config=tasks)

    # Générer le rapport agrégé
    report = generate_report(ingestion_results)

    tasks >> ingestion_results >> report


ingest_pj()
