import logging
from datetime import datetime, timedelta

from celery import shared_task

from config.settings import ENVIRONMENT
from utils.mattermost import DevMattermost

from .models import User

logger = logging.getLogger(__name__)


@shared_task
def check_inactive_admins() -> int:
    if ENVIRONMENT != "production":
        logger.info("Skipping check_inactive_admins task in non-prod environment")
        return 0

    users = User.objects.filter(
        is_superuser=True,
        last_login__lte=datetime.now().date() - timedelta(days=60),
    )

    inactive_admin_count = users.count()

    if inactive_admin_count == 0:
        logger.info("Aucun administrateur inactif trouvé")
        return 0

    if inactive_admin_count > 10:
        markdown_message = f":warning: Nombre d'administratifs inactifs : {inactive_admin_count}\n"
        markdown_message += "Le nombre est trop elevé pour être affiché ici.\n"
    else:
        markdown_message = ":warning: Les administrateurs suivants n'ont pas été actifs depuis plus de 2 mois :\n"
        for user in users:
            markdown_message += (
                f"- {user.email} - {user.first_name} - {user.last_name} | Last login : {user.last_login}\n"
            )

    mattermost = DevMattermost(msg=markdown_message)
    mattermost.send()

    return inactive_admin_count
