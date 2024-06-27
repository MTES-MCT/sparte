from django.db import models

from config.storages import PublicMediaStorage


def upload_in_land_folder(instance: "LandStaticFigure", filename: str) -> str:
    extension = filename.split(".")[-1]

    return f"land/{instance.land_type}/{instance.land_id}/{instance.params}.{extension}"


class LandStaticFigure(models.Model):
    class LandStaticFigureNameChoices(models.TextChoices):
        cover_image = "cover_image", "Image de couverture"
        theme_map_conso = "theme_map_conso", "Carte choroplèthe de consommation d'espace"
        theme_map_artif = "theme_map_artif", "Carte choroplèthe d'artificialisation"

    class Meta:
        verbose_name = "Figure statique"
        verbose_name_plural = "Figures statiques"

    land_type = models.CharField(max_length=200)
    land_id = models.CharField(max_length=200)
    params = models.JSONField()  # TODO : remove this field once we remove the params in the ui
    params_hash = models.CharField(max_length=200)
    figure_name = models.CharField(max_length=200)
    figure = models.ImageField(
        upload_to=upload_in_land_folder,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.land_type} - {self.land_id} "
