from typing import List, Union

import requests
from django.conf import settings


class MattermostException(Exception):
    pass


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
        response = requests.post(self.url, json=data)
        if response.ok:
            return True
        raise MattermostException(response.text)


class StartupSparte(Mattermost):
    """Send message in startup-sparte, channel general"""

    def __init__(self, *args, **kwargs):
        super().__init__(channel="startup-sparte", *args, **kwargs)  # noqa: B026


class SwannPrivate(Mattermost):
    """Send a message to Swann direct channel"""

    def __init__(self, *args, **kwargs):
        super().__init__(channel="@Swann", *args, **kwargs)  # noqa: B026


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
