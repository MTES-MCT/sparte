# Generated by Django 4.2.6 on 2023-11-20 14:48

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0101_auto_20231023_1423"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="zoneconstruite",
            name="built_density",
        ),
    ]
