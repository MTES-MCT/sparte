import threading
from typing import List, Union

import requests
from django.conf import settings


class MattermostException(Exception):
    pass


def request_task(url, json):
    requests.post(url, json=json)


def fire_and_forget(url, json):
    threading.Thread(target=request_task, args=(url, json)).start()


def format_table(data: List[List[str]], headers: Union[List[str], None] = None) -> str:
    content = ""
    if headers:
        content += f"| {' | '.join(headers)} |\n"
        content += f"|-{'-|-' * (len(headers) - 1)}-|\n"
    for row in data:
        content += f"| {' | '.join(row)} |\n"
    return content


class Mattermost:
    def __init__(self, msg: str, channel: Union[str, None] = None):
        self.msg = msg
        self.url = settings.MATTERMOST_URL
        self.information = ""
        self.channel = channel

    def send(self):
        data = {"text": self.msg}
        if self.channel:
            data["channel"] = self.channel
        data["props"] = {"card": f"{self.information}\n\nEnvironment: {settings.ENVIRONMENT}"}
        fire_and_forget(url=self.url, json=data)
        return True


class StartupSparte(Mattermost):
    """Send message in startup-sparte, channel general"""

    def __init__(self, *args, **kwargs):
        super().__init__(channel="startup-sparte", *args, **kwargs)  # noqa: B026


class SwannPrivate(Mattermost):
    """Send a message to Swann direct channel"""

    def __init__(self, *args, **kwargs):
        super().__init__(channel="@Swann", *args, **kwargs)  # noqa: B026


class Crisp(Mattermost):
    """Send message to inform that a Crisp notification has been received"""

    def __init__(self, *args, **kwargs):
        super().__init__(channel="sparte-crisp", *args, **kwargs)  # noqa: B026


class BlockedDiagnostic(Mattermost):
    """Send message to inform that some diagnostics are blocked"""

    def __init__(self, channel: str, data: List[List[str]]):
        super().__init__(
            msg=f":exclamation: il y a {len(data)} diagnostics bloqués !",
            channel=channel,
        )
        self.information = format_table(
            data=data,
            headers=["Date", "Diagnostic"],
        )
