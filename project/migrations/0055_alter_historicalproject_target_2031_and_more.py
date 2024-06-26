# Generated by Django 4.2.3 on 2023-07-31 13:39

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0054_historicalproject_available_millesimes_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="historicalproject",
            name="target_2031",
            field=models.IntegerField(
                default=50,
                help_text="A date, l'objectif national est de réduire de 50% la consommation d'espaces d'ici à 2031. Ce seuil doit être personnalisé localement par les SRADDET. Vous pouvez changer le seuil pour tester différents scénarios.",
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(100),
                ],
                verbose_name="Seuil de réduction à 2031 (en %)",
            ),
        ),
        migrations.AlterField(
            model_name="project",
            name="target_2031",
            field=models.IntegerField(
                default=50,
                help_text="A date, l'objectif national est de réduire de 50% la consommation d'espaces d'ici à 2031. Ce seuil doit être personnalisé localement par les SRADDET. Vous pouvez changer le seuil pour tester différents scénarios.",
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(100),
                ],
                verbose_name="Seuil de réduction à 2031 (en %)",
            ),
        ),
    ]
