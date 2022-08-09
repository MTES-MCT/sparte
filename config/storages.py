from storages.backends.s3boto3 import S3Boto3Storage


class StaticMediaStorage(S3Boto3Storage):
    """Enable access to data folder at root of the bucket."""

    location = "staticfiles"
    default_acl = "public-read"
    file_overwrite = True


class PublicMediaStorage(S3Boto3Storage):
    """Enable access to data folder at root of the bucket."""

    location = "media"
    default_acl = "public-read"
    file_overwrite = False
