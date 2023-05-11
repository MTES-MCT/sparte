from django.db import models
from django.urls import reverse


class WordTemplate(models.Model):
    slug = models.SlugField("Slug", primary_key=True)
    description = models.TextField("Description")
    docx = models.FileField("Modèle Word", upload_to="word_templates")
    last_update = models.DateTimeField("Dernière mise à jour", auto_now=True)
    filename_mask = models.CharField("Nom du fichier", max_length=255, default="")

    def get_absolute_url(self):
        return reverse("word_template:update", args={"slug": self.slug})

    def __str__(self):
        return self.slug

    class Meta:
        verbose_name = "Modèle Word"
        verbose_name_plural = "Modèles Word"
        ordering = ["slug"]
