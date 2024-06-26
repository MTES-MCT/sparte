# Generated by Django 4.2.11 on 2024-04-22 16:35

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0159_merge_20240418_1326"),
    ]

    operations = [
        migrations.AlterField(
            model_name="sudocuh",
            name="du_en_cours",
            field=models.CharField(
                blank=True,
                choices=[
                    ("CC", "Carte communale"),
                    ("POS", "Plan d'occupation des sols"),
                    ("PLU", "Plan local d'urbanisme"),
                    ("RNU", "Règlement national d'urbanisme"),
                    ("PLUi", "Plan local d'urbanisme intercommunal"),
                    ("PLUiS", "Plan local d'urbanisme intercommunal simplifié"),
                ],
                help_text="Document d'urbanisme en cours de création / révision (CC, POS, PLU, RNU, PLUi, PLUiS)",
                max_length=200,
                null=True,
                verbose_name="Document d'urbanisme en cours",
            ),
        ),
    ]
