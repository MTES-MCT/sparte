# Generated by Django 4.2.13 on 2024-07-14 15:54

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0083_alter_historicalrequest_organism_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="RNUPackage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(upload_to="rnu_packages/")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("departement_official_id", models.CharField(max_length=10)),
            ],
        ),
    ]