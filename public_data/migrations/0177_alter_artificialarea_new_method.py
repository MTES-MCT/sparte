# Generated by Django 4.2.13 on 2024-06-17 11:58

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0176_artificialarea_new_method"),
    ]

    operations = [
        migrations.AlterField(
            model_name="artificialarea",
            name="new_method",
            field=models.BooleanField(default=True, verbose_name="Issu de la nouvelle méthode de calcul"),
        ),
    ]
