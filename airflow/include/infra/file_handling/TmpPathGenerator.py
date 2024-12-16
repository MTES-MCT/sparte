import uuid

from include.domain.file_handling import BaseTmpPathGenerator


class TmpPathGenerator(BaseTmpPathGenerator):
    def __generate_uuid_filename(self) -> str:
        return str(uuid.uuid4())

    def get_tmp_path(self, filename=None) -> str:
        if not filename:
            # get random filename
            filename = self.__generate_uuid_filename()

        return f"{self.tmp_dir}/{filename}"
