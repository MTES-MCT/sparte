from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from project.models import Project


class Trajectory(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    start = models.IntegerField("Année de début", validators=[MinValueValidator(2000), MaxValueValidator(2075)])
    end = models.IntegerField("Année de fin", validators=[MinValueValidator(2000), MaxValueValidator(2075)])
    data = models.JSONField("Données")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name', 'start', 'end']

    def __str__(self):
        return self.name
