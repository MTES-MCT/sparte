# Generated by Django 4.2.9 on 2024-04-12 14:36

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0119_sudocuh"),
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
                help_text="Document d'urbanisme en cours de création / révision sur la commune (CC, POS, PLU, RNU, PLUi, PLUiS)Si la valeur est nulle, c'est que la commune est au RNU",
                max_length=200,
                null=True,
                verbose_name="Document d'urbanisme en cours",
            ),
        ),
        migrations.AlterField(
            model_name="sudocuh",
            name="du_opposable",
            field=models.CharField(
                choices=[
                    ("CC", "Carte communale"),
                    ("POS", "Plan d'occupation des sols"),
                    ("PLU", "Plan local d'urbanisme"),
                    ("RNU", "Règlement national d'urbanisme"),
                    ("PLUi", "Plan local d'urbanisme intercommunal"),
                    ("PLUiS", "Plan local d'urbanisme intercommunal simplifié"),
                ],
                default="RNU",
                help_text="Document d'urbanisme actuellement en vigueur sur la commune (CC, POS, PLU, RNU, PLUi, PLUiS)Valeur par défaut est RNU. Voir le commentaire sur data.gouv pour plus d'informations :https://www.data.gouv.fr/en/datasets/planification-nationale-des-documents-durbanisme-plu-plui-cc-rnu-donnees-sudocuh-dernier-etat-des-lieux-annuel-au-31-decembre-2023/#/discussions:~:text=Claire%20Chaine,pour%20votre%20alerte",
                max_length=200,
                verbose_name="Document d'urbanisme opposable",
            ),
        ),
    ]