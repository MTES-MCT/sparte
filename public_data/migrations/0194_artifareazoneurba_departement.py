# Generated by Django 4.2.13 on 2024-08-17 19:50

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0193_remove_zoneurba_public_data_insee_3f872f_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="artifareazoneurba",
            name="departement",
            field=models.CharField(default="", max_length=3, verbose_name="Département"),
            preserve_default=False,
        ),
    ]
