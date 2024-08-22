# Generated by Django 4.2.13 on 2024-08-22 09:15

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0187_auto_20240703_1704"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="artifareazoneurba",
            options={"managed": False},
        ),
        migrations.AlterModelOptions(
            name="artificialarea",
            options={
                "managed": False,
                "verbose_name": "OCSGE - Artificialisation (par commune)",
                "verbose_name_plural": "OCSGE - Artificialisation (par commune)",
            },
        ),
        migrations.AlterModelOptions(
            name="communediff",
            options={
                "managed": False,
                "verbose_name": "OCSGE - Différence (par commune)",
                "verbose_name_plural": "OCSGE - Différence (par commune)",
            },
        ),
        migrations.AlterModelOptions(
            name="communesol",
            options={
                "managed": False,
                "verbose_name": "OCSGE - Couverture x usage des sols (par commune)",
                "verbose_name_plural": "OCSGE - Couverture x usage des sols (par commune)",
            },
        ),
        migrations.AlterModelOptions(
            name="ocsge",
            options={"managed": False, "verbose_name": "OCSGE", "verbose_name_plural": "OCSGE"},
        ),
        migrations.AlterModelOptions(
            name="ocsgediff",
            options={
                "managed": False,
                "verbose_name": "OCSGE - Différence",
                "verbose_name_plural": "OCSGE - Différence",
            },
        ),
        migrations.AlterModelOptions(
            name="zoneconstruite",
            options={
                "managed": False,
                "verbose_name": "OCSGE - Zone construite",
                "verbose_name_plural": "OCSGE - Zone construite",
            },
        ),
        migrations.AlterModelOptions(
            name="zoneurba",
            options={"managed": False},
        ),
        migrations.RemoveField(
            model_name="commune",
            name="map_color",
        ),
    ]
