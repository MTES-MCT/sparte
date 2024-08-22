import requests


class Mattermost:
    def __init__(
        self,
        channel: str,
        mattermost_webhook_url: str,
    ):
        self.url = mattermost_webhook_url
        self.channel = channel

    def send(self, msg: str) -> requests.Response:
        data = {
            "text": msg,
            "channel": self.channel,
        }
        return requests.post(self.url, json=data)
