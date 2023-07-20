from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from project.models import Project


class Trajectory(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    start = models.IntegerField("Année de début", validators=[MinValueValidator(2021), MaxValueValidator(2075)])
    end = models.IntegerField("Année de fin", validators=[MinValueValidator(2021), MaxValueValidator(2075)])
    data = models.JSONField("Données")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_value_per_year(self):
        return {y: self.data.get(str(y), 0) for y in range(int(self.start), int(self.end) + 1)}

    class Meta:
        ordering = ["name", "start", "end"]

    def __str__(self):
        return self.name
