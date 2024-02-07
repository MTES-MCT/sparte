from django.conf import settings
from django.core.management.base import BaseCommand

from utils.mattermost import Mattermost


class Command(BaseCommand):
    """A simple management command to send message to Mattermost."""

    help = "Send message to Mattermost."

    def add_arguments(self, parser):
        parser.add_argument(
            "--channel",
            type=str,
            help="Mattermost channel or person like startup-spart or @Swann",
        )
        parser.add_argument(
            "--msg",
            type=str,
            help="Message to send",
        )

    def handle(self, *args, **options):
        mattermost = Mattermost(
            msg=options["msg"] if "msg" in options else "Hello World!",
            channel=options["channel"] if "channel" in options else settings.MATTER_DEV_CHANNEL,
        )
        mattermost.send()
