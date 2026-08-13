import os

import py7zr

from .BaseArchiveHandler import BaseArchiveHandler


class SevenZArchiveHandler(BaseArchiveHandler):
    def extract(self, archive_path: str, extract_dir: str) -> None:
        os.makedirs(extract_dir, exist_ok=True)
        with py7zr.SevenZipFile(archive_path, mode="r") as archive:
            archive.extractall(path=extract_dir)
