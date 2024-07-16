from abc import ABC, abstractmethod


class ClassCacher(ABC):
    @abstractmethod
    def exists(self, key) -> bool:
        pass

    @abstractmethod
    def get(self, key):
        pass

    @abstractmethod
    def set(self, key, value):
        pass
