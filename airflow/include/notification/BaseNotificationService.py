from abc import ABC, abstractmethod


class BaseNotificationService(ABC):
    @abstractmethod
    def send(self, message: str) -> None:
        """
        Envoie une notification
        """
