from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from django.contrib.gis.db import models as gis_models


def user_directory_path(instance, filename):
    year = timezone.now().year
    month = timezone.now().month
    id = instance.user.id
    return f"user_{id}/{year}{month:02}/{filename}"


class Project(models.Model):
    IMPORT_PENDING = "PENDING"
    IMPORT_SUCCESS = "SUCCESS"
    IMPORT_FAILED = "FAILED"
    IMPORT_STATUS_CHOICES = [
        (IMPORT_PENDING, "Import pending to be processed"),
        (IMPORT_SUCCESS, "Import successfuly processed"),
        (IMPORT_FAILED, "Import failed, see import message"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, verbose_name=_("owner")
    )
    name = models.CharField(_("project name"), max_length=100)
    shape_file = models.FileField(
        _("shape files"), upload_to=user_directory_path, max_length=100
    )
    analyse_start_date = models.DateField()
    analyse_end_date = models.DateField()

    # field to track the shape files importation into the database
    import_error = models.TextField(
        _("shp file import error message"), null=True, blank=True
    )
    import_date = models.DateTimeField(_("import date & time"), null=True, blank=True)
    import_status = models.CharField(
        _(""),
        max_length=10,
        choices=IMPORT_STATUS_CHOICES,
        default=IMPORT_PENDING,
    )

    def get_absolute_url(self):
        return reverse("project:update", kwargs={"pk": self.pk})

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Emprise(gis_models.Model):

    project = gis_models.ForeignKey(
        Project, on_delete=models.PROTECT, verbose_name=_("project")
    )
    mpoly = gis_models.MultiPolygonField()

    class Meta:
        ordering = ["project"]
