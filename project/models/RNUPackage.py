from django.db import models


class RNUPackage(models.Model):
    file = models.FileField(upload_to="rnu_packages/")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    departement_official_id = models.CharField(max_length=10)
