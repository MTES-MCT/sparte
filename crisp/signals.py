from textwrap import dedent

from utils.mattermost import Crisp


def on_notification_save(sender, instance, created, *args, **kwargs):
    if created:
        message_with_link = f"[{instance.message}]({instance.inbox_url})"

        message = dedent(
            f"""
        Nouveau message reçu sur Crisp.
        Evénement : {instance.event}
        Origine : {instance.origin}
        Date : {instance.timestamp}
        Message : {message_with_link}
        """
        )

        notification = Crisp(msg=message)
        notification.send()

    return instance
