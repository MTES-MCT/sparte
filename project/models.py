from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


def user_directory_path(instance, filename):
    year = timezone.now().year
    month = timezone.now().month
    id = instance.user.id
    return f"user_{id}/{year}{month:02}/{filename}"


class Project(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, verbose_name=_("owner")
    )
    name = models.CharField(_("project name"), max_length=100)
    shape_file = models.FileField(
        _("shape files"), upload_to=user_directory_path, max_length=100
    )
    analyse_start_date = models.DateField()
    analyse_end_date = models.DateField()

    def get_absolute_url(self):
        return reverse("project:update", kwargs={"pk": self.pk})

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
