from include.domain.file_handling import BaseS3Handler


class S3Handler(BaseS3Handler):
    def __init__(self, s3):
        self.s3 = s3

    def upload_file(self, local_file_path, s3_bucket, s3_key):
        self.s3.put(local_file_path, f"{s3_bucket}/{s3_key}")
        return f"{s3_bucket}/{s3_key}"

    def download_file(self, s3_bucket, s3_key, local_file_path):
        self.s3.get(f"{s3_bucket}/{s3_key}", local_file_path)
        return local_file_path
