# Generated by Django 4.2.13 on 2024-07-18 12:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("project", "0088_alter_rnupackage_file"),
    ]

    operations = [
        migrations.CreateModel(
            name="RNUPackageRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("departement_official_id", models.CharField(max_length=10)),
                ("email", models.EmailField(max_length=254)),
                ("requested_at", models.DateTimeField(auto_now_add=True)),
                ("requested_diagnostics_before_package_request", models.IntegerField()),
                ("account_created_for_package", models.BooleanField()),
                (
                    "rnu_package",
                    models.ForeignKey(
                        null=True, on_delete=django.db.models.deletion.SET_NULL, to="project.rnupackage"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
        ),
    ]