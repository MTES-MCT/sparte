import gzip
import logging
import os
import shutil

from .BaseS3Handler import BaseS3Handler
from .BaseTmpPathGenerator import BaseTmpPathGenerator

logger = logging.getLogger(__name__)


class GeoJsonToGzippedGeoJsonOnS3Handler:
    def __init__(
        self,
        s3_handler: BaseS3Handler,
        tmp_path_generator: BaseTmpPathGenerator,
    ):
        self.s3_handler = s3_handler
        self.tmp_path_generator = tmp_path_generator

    def compress_geojson_and_upload_to_s3(
        self,
        s3_source_key: str,
        s3_bucket: str,
    ) -> str:
        """
        Downloads a GeoJSON file from S3, compresses it with gzip, and uploads the .geojson.gz file.

        Args:
            s3_source_key: S3 object key of the source GeoJSON file
            s3_bucket: S3 bucket name

        Returns:
            Path to the uploaded gzipped file on S3
        """
        tmp_geojson = f"{self.tmp_path_generator.get_tmp_path()}.geojson"
        tmp_gzipped = f"{tmp_geojson}.gz"

        logger.info(f"Downloading s3://{s3_bucket}/{s3_source_key} to {tmp_geojson}")

        self.s3_handler.download_file(
            s3_key=s3_source_key,
            s3_bucket=s3_bucket,
            local_file_path=tmp_geojson,
        )

        logger.info(f"Downloaded to {tmp_geojson}")

        logger.info(f"Compressing {tmp_geojson} to {tmp_gzipped}")

        with open(tmp_geojson, "rb") as f_in:
            with gzip.open(tmp_gzipped, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)

        logger.info(f"Compressed to {tmp_gzipped}")

        # Generate the S3 key for the gzipped file
        s3_gzipped_key = f"{s3_source_key}.gz"

        logger.info(f"Uploading {tmp_gzipped} to s3://{s3_bucket}/{s3_gzipped_key}")

        # Upload with Content-Encoding header set to gzip
        s3_full_path = f"{s3_bucket}/{s3_gzipped_key}"
        self.s3_handler.s3.put(
            tmp_gzipped,
            s3_full_path,
            ContentEncoding="gzip",
            ContentType="application/geo+json",
        )

        logger.info(f"Uploaded {tmp_gzipped} to {s3_full_path}")

        logger.info("Deleting temporary files")

        os.remove(tmp_geojson)
        os.remove(tmp_gzipped)

        logger.info("Deleted temporary files")

        return s3_full_path
