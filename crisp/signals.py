from textwrap import dedent

from utils.mattermost import Crisp


def on_notification_save(
    sender,
    instance,
    created,
    *args,
    **kwargs,
):
    if created and instance.event == "message:received" and instance.from_value == "user":
        instance.data

        message = dedent(
            f"""
        Date : {instance.timestamp}
        URL crisp : {instance.inbox_url}
        Nom : {instance.sender_name}
        Email : {instance.sender_email}
        Message : {instance.message}
        """
        )

        notification = Crisp(msg=message)
        notification.send()

    return instance
