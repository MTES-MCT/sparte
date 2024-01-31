import re
from typing import Any, Callable, Dict, Tuple

from public_data.models import DataSource


class LayerMapperFactory:
    def __init__(self, data_source: DataSource):
        self.data_source = data_source

    def get_class_properties(self, module_name: str) -> Dict[str, Any]:
        properties = {
            "Meta": type("Meta", (), {"proxy": True}),
            "shape_file_path": self.data_source.path,
            "departement_id": self.data_source.official_land_id,
            "srid": self.data_source.srid,
            "__module__": module_name,
        }
        if self.data_source.mapping:
            properties["mapping"] = self.data_source.mapping
        return properties

    def get_base_class(self) -> Tuple[Callable]:
        """Return the base class from which the proxy should inherit from.

        The base class returned should be a child of AutoLoadMixin:
        >>> if not issubclass(base_class, AutoLoadMixin):
        >>>    raise TypeError(f"Base class {base_class} should inherit from AutoLoadMixin.")
        """
        raise NotImplementedError("You need to define which base class to use.")

    def get_class_name(self) -> str:
        """Build a class name in KamelCase.

        Naming rule: Auto{data_name}{official_land_id}{year}
        Example: AutoOcsgeDiff3220182021
        """
        raw_words = ["Auto", self.data_source.name, self.data_source.official_land_id]
        raw_words += list(map(str, self.data_source.millesimes))
        splited_words = [sub_word for word in raw_words for sub_word in word.split("_")]
        cleaned_words = [re.sub(r"[^\W_]", "", word) for word in splited_words]
        class_name = "".join([word.capitalize() for word in cleaned_words if word])
        return class_name

    def get_layer_mapper_proxy_class(self, module_name: str = __name__) -> Callable:
        return type(
            self.get_class_name(),
            self.get_base_class(),
            self.get_class_properties(module_name),
        )
