import requests
from include.domain.notification import BaseNotificationService


class MattermostNotificationService(BaseNotificationService):
    def __init__(self, mattermost_webhook_url, channel):
        self.mattermost_webhook_url = mattermost_webhook_url
        self.channel = channel

    def send(self, message: str) -> None:
        data = {"text": message, "channel": self.channel}

        request = requests.post(url=self.mattermost_webhook_url, json=data)
        return request.ok
