# Generated by Django 3.2.5 on 2022-01-14 16:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("public_data", "0040_rename_naf11art20_refplan_naf11art21"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="RefPlan",
            new_name="Cerema",
        ),
        migrations.CreateModel(
            name="RefPlan",
            fields=[],
            options={
                "proxy": True,
                "indexes": [],
                "constraints": [],
            },
            bases=("public_data.cerema",),
        ),
        migrations.AlterModelTable(
            name="cerema",
            table="public_data_refplan",
        ),
    ]
