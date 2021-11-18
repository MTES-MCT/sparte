from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings


class DatabaseStorage(S3Boto3Storage):
    """Enable access to data folder at root of the bucket."""

    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = "dbbackup"
