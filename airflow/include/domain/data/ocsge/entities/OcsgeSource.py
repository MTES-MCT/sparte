from dataclasses import dataclass

from include.domain.data.ocsge.enums import SourceName


@dataclass
class OcsgeSource:
    type: SourceName
    url: str
    years: list[int]
    departement: str

    @property
    def filename(self) -> str:
        return self.url.split("/")[-1]
