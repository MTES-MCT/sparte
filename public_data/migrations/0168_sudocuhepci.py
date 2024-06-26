# Generated by Django 4.2.13 on 2024-06-03 11:42

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0167_rename_surfcom2022_cerema_surfcom23"),
    ]

    operations = [
        migrations.CreateModel(
            name="SudocuhEpci",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nom_region", models.CharField(max_length=200)),
                ("code_departement", models.CharField(max_length=200)),
                ("nom_departement", models.CharField(max_length=200)),
                ("siren", models.CharField(max_length=200)),
                (
                    "type_epci",
                    models.CharField(
                        choices=[
                            ("CC", "Communauté de communes"),
                            ("CA", "Communauté d'agglomération"),
                            ("CU", "Communauté urbaine"),
                            ("EPT", "Établissement public territorial"),
                            ("MET", "Métropole"),
                            ("PETR", "Pôle d'équilibre territorial et rural"),
                            ("PM", "Pays"),
                            ("SM", "Syndicat mixte"),
                            ("SI", "Syndicat intercommunal"),
                            ("AUTRE", "Autre"),
                        ],
                        max_length=200,
                    ),
                ),
                ("nom_epci", models.CharField(max_length=200)),
                ("date_creation_epci", models.DateField()),
                ("epci_interdepartemental", models.BooleanField()),
                ("competence_plan", models.BooleanField()),
                ("competence_scot", models.BooleanField()),
                ("competence_plh", models.BooleanField()),
                ("obligation_plh", models.BooleanField()),
                ("nb_communes", models.IntegerField()),
                ("insee_pop_tot_2021", models.IntegerField()),
                ("insee_pop_municipale", models.IntegerField()),
                ("insee_superficie", models.FloatField()),
            ],
        ),
    ]
