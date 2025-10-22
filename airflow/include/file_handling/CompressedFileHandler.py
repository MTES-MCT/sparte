"""
Handler pour extraire des fichiers compressés (.7z) et rechercher des fichiers spécifiques.

Ce handler fournit des utilitaires pour :
- Extraire des archives .7z
- Rechercher des fichiers par extension
- Nettoyer les répertoires temporaires
"""

import glob
import logging
import shutil
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)


class CompressedFileHandler:
    """
    Handler bas niveau pour les opérations sur les fichiers compressés.

    Ce handler ne gère pas S3 ni les bases de données - il se concentre uniquement
    sur l'extraction et la recherche de fichiers locaux.
    """

    def extract_7z(self, archive_path: str, extract_dir: str) -> str:
        """
        Extrait un fichier .7z.

        Args:
            archive_path: Chemin vers le fichier .7z
            extract_dir: Répertoire de destination

        Returns:
            Chemin du répertoire d'extraction

        Raises:
            RuntimeError: Si l'extraction échoue
        """
        logger.info(f"Extraction de {Path(archive_path).name} vers {extract_dir}...")

        result = subprocess.run(
            ["7z", "x", "-y", f"-o{extract_dir}", str(archive_path)],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            raise RuntimeError(f"Échec de l'extraction: {result.stderr}")

        logger.info(f"✓ Extraction réussie dans {extract_dir}")
        return extract_dir

    def find_files_by_extension(
        self,
        directory: str,
        extension: str,
        recursive: bool = True,
    ) -> list[str]:
        """
        Trouve tous les fichiers avec une extension donnée dans un répertoire.

        Args:
            directory: Répertoire de recherche
            extension: Extension à rechercher (ex: ".gpkg", ".shp")
            recursive: Recherche récursive dans les sous-dossiers

        Returns:
            Liste des chemins de fichiers trouvés

        Raises:
            FileNotFoundError: Si aucun fichier n'est trouvé
        """
        # Normaliser l'extension (ajouter le point si nécessaire)
        if not extension.startswith("."):
            extension = f".{extension}"

        pattern = f"{directory}/**/*{extension}" if recursive else f"{directory}/*{extension}"
        files = glob.glob(pattern, recursive=recursive)

        if not files:
            all_files = [f.name for f in Path(directory).rglob("*") if f.is_file()]
            raise FileNotFoundError(
                f"Aucun fichier {extension} trouvé dans {directory}. " f"Fichiers présents: {all_files}"
            )

        logger.info(f"✓ Trouvé {len(files)} fichier(s) {extension}")
        return files

    def extract_and_find(
        self,
        archive_path: str,
        extract_dir: str,
        target_extension: str,
        cleanup_archive: bool = True,
    ) -> str:
        """
        Extrait une archive et trouve le premier fichier avec l'extension cible.

        Args:
            archive_path: Chemin vers l'archive .7z
            extract_dir: Répertoire d'extraction
            target_extension: Extension du fichier recherché (ex: ".gpkg")
            cleanup_archive: Supprimer l'archive après extraction

        Returns:
            Chemin du fichier trouvé

        Raises:
            FileNotFoundError: Si aucun fichier n'est trouvé
            RuntimeError: Si l'extraction échoue
        """
        # Extraire
        self.extract_7z(archive_path, extract_dir)

        # Nettoyer l'archive si demandé
        if cleanup_archive:
            Path(archive_path).unlink()
            logger.info(f"✓ Archive supprimée: {Path(archive_path).name}")

        # Trouver le fichier cible
        files = self.find_files_by_extension(extract_dir, target_extension)

        # Retourner le premier fichier trouvé
        return files[0]

    def cleanup_directory(self, directory: str) -> None:
        """
        Supprime un répertoire et son contenu.

        Args:
            directory: Répertoire à supprimer
        """
        shutil.rmtree(directory, ignore_errors=True)
        logger.info(f"✓ Répertoire nettoyé: {directory}")
