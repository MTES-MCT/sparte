from utils.mattermost import Crisp


def format_message(instance):
    return f"""Date : {instance.timestamp}
Lien Crisp : {instance.inbox_url}
Nom : {instance.sender_name}
Message : {instance.message}"""


def on_notification_save(
    sender,
    instance,
    created,
    *args,
    **kwargs,
):
    message_is_sent = instance.event == "message:send"
    message_is_from_user = instance.from_value == "user"
    message_is_text = instance.data.get("type") == "text"
    message_is_sent_by_user = message_is_sent and message_is_from_user

    if created and message_is_sent_by_user and message_is_text:
        notification = Crisp(msg=format_message(instance))
        notification.send()

    return instance
