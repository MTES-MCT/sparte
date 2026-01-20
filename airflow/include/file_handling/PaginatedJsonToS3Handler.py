import json
import logging
import os

import requests

from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class PaginatedJsonToS3Handler:
    def __init__(
        self,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
    ):
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator

    def download_paginated_json_and_upload_to_s3(
        self,
        url: str,
        s3_key: str,
        s3_bucket: str,
        next_page_key: str = "next_page",
        data_key: str = "data",
    ) -> str:
        """
        Télécharge récursivement un JSON paginé et upload le résultat sur S3.

        Args:
            url: URL de la première page
            s3_key: Clé S3 pour le fichier uploadé
            s3_bucket: Nom du bucket S3
            next_page_key: Clé JSON pour récupérer l'URL de la page suivante
            data_key: Clé JSON pour récupérer les données de chaque page

        Returns:
            Le chemin S3 du fichier uploadé
        """
        all_data = []
        current_url = url
        page_count = 0

        while current_url:
            page_count += 1
            logger.info(f"Downloading page {page_count} from {current_url}")

            response = requests.get(current_url)
            response.raise_for_status()
            json_response = response.json()

            page_data = json_response.get(data_key, [])
            all_data.extend(page_data)
            logger.info(f"Page {page_count}: retrieved {len(page_data)} items (total: {len(all_data)})")

            current_url = json_response.get(next_page_key)

        logger.info(f"Download complete: {len(all_data)} items from {page_count} pages")

        local_file_path = self.tmp_path_generator.get_tmp_path(filename=None)
        with open(local_file_path, "w") as f:
            json.dump(all_data, f)

        upload_path = self.s3_handler.upload_file(
            local_file_path=local_file_path,
            s3_key=s3_key,
            s3_bucket=s3_bucket,
        )
        logger.info(f"File uploaded to {upload_path}")

        os.remove(local_file_path)
        logger.info(f"Deleted temporary file {local_file_path}")

        return upload_path
