import time
from typing import List

import requests
from django.conf import settings


class MattermostException(Exception):
    pass


def format_table(data: List[List[str]], headers: List[str] = None) -> str:
    content = ""
    if headers:
        content += f"| {' | '.join(headers)} |\n"
        content += f"|-{'-|-' * (len(headers) - 1)}-|\n"
    for row in data:
        content += f"| {' | '.join(row)} |\n"
    return content


class Mattermost:
    def __init__(self, msg: str, channel: str = None) -> bool:
        self.msg = msg
        self.url = settings.MATTERMOST_URL
        self.information = ""
        self.channel = channel

    def send(self):
        data = {"text": self.msg}
        if self.channel:
            data["channel"] = self.channel
        if self.information:
            data["props"] = {"card": self.information}
        response = requests.post(self.url, json=data)
        if response.ok:
            return True
        raise MattermostException(response.text)


class StartupSparte(Mattermost):
    """Send message in startup-sparte, channel general"""

    def __init__(self, *args, **kwargs):
        super().__init__(channel="startup-sparte", *args, **kwargs)


class SwannPrivate(Mattermost):
    """Send a message to Swann direct channel"""

    def __init__(self, *args, **kwargs):
        super().__init__(channel="@Swann", *args, **kwargs)
