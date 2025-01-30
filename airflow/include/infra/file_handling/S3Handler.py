from include.domain.file_handling import BaseS3Handler


class S3Handler(BaseS3Handler):
    def __init__(self, s3):
        self.s3 = s3

    def upload_file(self, local_file_path, s3_bucket, s3_key):
        self.s3.put(local_file_path, f"{s3_bucket}/{s3_key}")
        return f"{s3_bucket}/{s3_key}"

    def file_exists(self, s3_bucket, s3_key):
        return self.s3.exists(f"{s3_bucket}/{s3_key}")

    def download_file(self, s3_bucket, s3_key, local_file_path):
        self.s3.get(f"{s3_bucket}/{s3_key}", local_file_path)
        return local_file_path

    def list_files(self, s3_bucket, s3_key):
        return self.s3.ls(f"{s3_bucket}/{s3_key}")

    def move_from_bucket_a_to_bucket_b(self, s3_key, bucket_a, bucket_b):
        return self.s3.copy(f"{bucket_a}/{s3_key}", f"{bucket_b}/{s3_key}")

    def set_key_publicly_visible(self, s3_key, s3_bucket):
        acl = "public-read"
        return self.s3.chmod(f"{s3_bucket}/{s3_key}", acl)
