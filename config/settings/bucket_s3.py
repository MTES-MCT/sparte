"""
Settings for app using django-storage with AWS S3
https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html
"""
from .base import env


# specify to django we use only S3 to store files
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

# credentials
AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY")

# bucket name and region
AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = env("AWS_S3_REGION_NAME")

# append a prefix to all uploaded file (useful to not mix local, staging...)
AWS_LOCATION = env("AWS_LOCATION")
# avoid overriding a file if same key is provided
AWS_S3_FILE_OVERWRITE = False
# allow signed url to be accessed from all regions
AWS_S3_SIGNATURE_VERSION = "s3v4"
