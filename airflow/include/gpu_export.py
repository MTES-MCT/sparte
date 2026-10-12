"""
Export hebdomadaire du Géoportail de l'Urbanisme (GPU).

Depuis la version 6.2 du GPU, l'export hebdomadaire est publié en HTTP via un flux
Atom, qui remplace l'ancien serveur SFTP de l'IGN. Le flux liste un geopackage par
couche (zone_urba, scot, …) ; les liens changent à chaque extraction, il faut donc
relire le flux à chaque téléchargement.
"""

import hashlib
import xml.etree.ElementTree as ET
from dataclasses import dataclass

import requests

GPU_LATEST_EXPORT_FEED_URL = "https://www.geoportail-urbanisme.gouv.fr/api/extraction/download-latest"

ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}


@dataclass(frozen=True)
class GpuExportFile:
    url: str
    md5: str


def get_latest_gpu_export_file(layer: str) -> GpuExportFile:
    """Retourne le lien et la somme MD5 du geopackage `layer` dans le dernier export."""
    response = requests.get(GPU_LATEST_EXPORT_FEED_URL, timeout=60)
    response.raise_for_status()
    feed = ET.fromstring(response.content)

    for entry in feed.findall("atom:entry", ATOM_NS):
        link = entry.find("atom:link", ATOM_NS)
        if link is not None and link.get("href", "").endswith(f".{layer}.gpkg"):
            return GpuExportFile(url=link.get("href"), md5=entry.findtext("atom:content", namespaces=ATOM_NS))

    raise ValueError(f"Couche {layer} absente du dernier export GPU ({GPU_LATEST_EXPORT_FEED_URL})")


def download_gpu_export_file(export_file: GpuExportFile, local_path: str) -> None:
    """Télécharge le fichier en streaming et vérifie sa somme MD5."""
    # Contrôle d'intégrité du téléchargement uniquement : c'est la somme fournie par le flux
    md5 = hashlib.md5(usedforsecurity=False)
    with requests.get(export_file.url, stream=True, timeout=60) as response:
        response.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)
                md5.update(chunk)

    if md5.hexdigest() != export_file.md5:
        raise ValueError(
            f"Somme MD5 invalide pour {export_file.url} : attendu {export_file.md5}, obtenu {md5.hexdigest()}"
        )
