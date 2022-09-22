from io import BytesIO
from pathlib import Path

from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class ExportStorage(S3Boto3Storage):
    """Enable access to data folder at root of the bucket."""

    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = "exports"
    default_acl = "private"
    file_overwrite = False
    custom_domain = False
    querystring_auth = True

    def save_xlsx(self, name: str, content: BytesIO) -> Path:
        if not name.endswith("xlsx"):
            name += ".xlsx"
        return self.save(name, content)
