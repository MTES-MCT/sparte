import pickle
from typing import Any

from django.core.cache import BaseCache

from public_data.domain.ClassCacher import ClassCacher


class PickleClassCacher(ClassCacher):
    def __init__(self, cache: BaseCache):
        self.cache = cache

    def exists(self, key) -> bool:
        return self.cache.has_key(key)

    def get(self, key) -> Any | None:
        pickled_data = self.cache.get(key)
        return pickle.loads(pickled_data) if pickled_data else None

    def set(self, key, value) -> None:
        pickled_data = pickle.dumps(value)
        self.cache.set(key=key, value=pickled_data)
