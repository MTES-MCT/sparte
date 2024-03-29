# Generated by Django 4.2.3 on 2023-07-31 13:39

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("metabase", "0005_statdiagnostic_group_organism"),
    ]

    operations = [
        migrations.AddField(
            model_name="statdiagnostic",
            name="date_first_trajectory",
            field=models.DateTimeField(blank=True, null=True, verbose_name="Date de la première trajectoire"),
        ),
        migrations.AddField(
            model_name="statdiagnostic",
            name="has_trajectory",
            field=models.BooleanField(default=False, verbose_name="A une trajectoire"),
        ),
    ]
