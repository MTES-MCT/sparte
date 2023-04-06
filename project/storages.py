from io import BytesIO
from os.path import join
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

    def list_excel(self, name=""):
        directory_list, file_list = self.listdir(name=name)
        for directory in directory_list:
            file_list += [join(name, directory, f) for f in self.list_excel(name=join(name, directory))]
        return (f for f in file_list if f.endswith("xlsx") or f.endswith("xls"))
