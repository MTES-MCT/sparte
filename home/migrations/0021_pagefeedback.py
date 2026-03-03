import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("home", "0020_alter_contactform_status"),
    ]

    operations = [
        migrations.CreateModel(
            name="PageFeedback",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "rating",
                    models.PositiveSmallIntegerField(
                        help_text="Note de 1 à 5 étoiles.",
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                        verbose_name="Note",
                    ),
                ),
                (
                    "comment",
                    models.TextField(blank=True, default="", verbose_name="Commentaire"),
                ),
                (
                    "page_url",
                    models.CharField(max_length=500, verbose_name="URL de la page"),
                ),
                (
                    "land_type",
                    models.CharField(blank=True, default="", max_length=50, verbose_name="Type de territoire"),
                ),
                (
                    "land_id",
                    models.CharField(blank=True, default="", max_length=100, verbose_name="Identifiant du territoire"),
                ),
                (
                    "land_name",
                    models.CharField(blank=True, default="", max_length=255, verbose_name="Nom du territoire"),
                ),
                (
                    "page_name",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text="Thématique de la page (ex: Consommation, Artificialisation…).",
                        max_length=100,
                        verbose_name="Nom de la page",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Utilisateur",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="Date de création"),
                ),
            ],
            options={
                "verbose_name": "Feedback de page",
                "verbose_name_plural": "Feedbacks de page",
                "ordering": ["-created_at"],
            },
        ),
    ]
