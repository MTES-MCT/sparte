# Generated by Django 4.2.13 on 2024-07-18 12:07

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0011_alter_user_organism"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, null=True, verbose_name="Créé le"),
        ),
        migrations.AddField(
            model_name="user",
            name="updated_at",
            field=models.DateTimeField(auto_now=True, null=True, verbose_name="Mis à jour le"),
        ),
    ]
