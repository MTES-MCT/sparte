# Generated by Django 3.2.11 on 2022-03-22 10:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("public_data", "0042_alter_cerema_table"),
    ]

    operations = [
        migrations.AlterField(
            model_name="cerema",
            name="city_insee",
            field=models.CharField(db_index=True, max_length=5),
        ),
    ]
