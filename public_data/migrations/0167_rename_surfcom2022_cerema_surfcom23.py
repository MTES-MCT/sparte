# Generated by Django 4.2.11 on 2024-05-02 13:03

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0166_rename_artpop1319_cerema_artpop1420_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="cerema",
            old_name="surfcom2022",
            new_name="surfcom23",
        ),
    ]
