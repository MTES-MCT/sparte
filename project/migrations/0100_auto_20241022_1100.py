# Generated by Django 4.2.13 on 2024-10-22 09:00

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0099_auto_20241022_1057"),
    ]

    operations = [
        migrations.RunSQL(
            """
        UPDATE project_projectcommune
        SET commune_id = commune_insee;

    """
        )
    ]
