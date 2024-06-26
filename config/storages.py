from storages.backends.s3boto3 import S3Boto3Storage


class DefaultStorage(S3Boto3Storage):
    """Default in case of hook is needed."""


class PublicMediaStorage(S3Boto3Storage):
    """Enable access to data folder at root of the bucket."""

    location = "media"
    default_acl = "public-read"
    querystring_auth = False
