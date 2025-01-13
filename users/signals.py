from django.conf import settings
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

from utils.mattermost import Mattermost


@receiver(user_logged_in)
def on_login(sender, user, request, **kwargs):
    if user.is_staff or user.is_superuser:
        Mattermost(
            msg=f"[{user.email}]({settings.DOMAIN_URL}/admin/users/user/{user.id}/change) vient de se connecter au serveur {settings.DOMAIN_URL} ",  # noqa: E501
            channel=settings.MATTER_DEV_CHANNEL,
        ).send()
