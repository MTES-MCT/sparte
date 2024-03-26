from utils.mattermost import Crisp


def on_notification_save(sender, instance, created, *args, **kwargs):
    if created:
        notification = Crisp(msg=f"Crisp : {instance.message}")
        notification.send()
