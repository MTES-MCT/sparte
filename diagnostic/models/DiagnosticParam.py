from django.db import models

from users.models import User

from .Diagnostic import Diagnostic


class DiagnosticParam(models.Model):
    diagnostic = models.ForeignKey(Diagnostic)
    user = models.ForeignKey(User)
    objectif_zan_2031 = models.DecimalField()
