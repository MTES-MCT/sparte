from django.db import models

from .RNUPackage import RNUPackage


class RNUPackageRequest(models.Model):
    rnu_package = models.ForeignKey(RNUPackage, on_delete=models.SET_NULL, null=True)
    departement_official_id = models.CharField(max_length=10)
    user = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    email = models.EmailField()
    requested_at = models.DateTimeField(auto_now_add=True)
    requested_diagnostics_before_package_request = models.IntegerField()
    account_created_for_package = models.BooleanField()
