from django.utils import timezone


def user_directory_path(instance, filename):
    """Return a path (as a string) like user_1/202101/myfile.shp
    if instance doesn't have user property, only return end of the path"""
    today = timezone.now()
    path = f"{today.year}{today.month:02}/{filename}"
    try:
        return f"user_{instance.user.id:04}/{path}"
    except AttributeError:
        return path
