# Generated by Django 4.2.13 on 2024-10-22 08:57

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0098_auto_20241022_1051"),
    ]

    operations = [
        migrations.RunSQL(
            """
    ALTER TABLE public.project_projectcommune
    ALTER COLUMN commune_id TYPE text USING commune_id::text;


    """
        )
    ]
