from django.db import models
from django.urls import reverse
from django.utils.text import slugify

from markdown import markdown


class FrequentlyAskedQuestion(models.Model):
    """https://www.markdownguide.org/basic-syntax"""

    slug = models.SlugField()
    title = models.CharField("Titre", max_length=400)
    menu_entry = models.CharField("Titre dans le menu", max_length=100)
    md_content = models.TextField("Contenu en markdown")
    is_published = models.BooleanField("Rendre public", default=False)
    order = models.IntegerField("Order d'affichage", default=0)

    class Meta:
        ordering = ["order"]

    @property
    def get_html(self):
        return markdown(self.md_content)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("home:faq-detail", args=[self.slug])
