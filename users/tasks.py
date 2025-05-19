import logging
from datetime import datetime, timedelta

from celery import shared_task

from utils.mattermost import DevMattermost

from .models import User

logger = logging.getLogger(__name__)


@shared_task
def check_inactive_admins() -> int:
    users = User.objects.filter(
        is_superuser=True,
        last_login__lte=datetime.now().date() - timedelta(days=60),
    )

    if users.count() > 10:
        markdown_message = f":warning: Nombre d'administratifs inactifs : {users.count()}\n"
        markdown_message += "Le nombre est trop elevé pour être affiché ici.\n"
    else:
        markdown_message = ":warning: Les administrateurs suivants n'ont pas été actifs depuis plus de 2 mois :\n"
        for user in users:
            markdown_message += (
                f"- {user.email} - {user.first_name} - {user.last_name} | Last login : {user.last_login}\n"
            )

    mattermost = DevMattermost(msg=markdown_message)
    mattermost.send()

    return users.count()
