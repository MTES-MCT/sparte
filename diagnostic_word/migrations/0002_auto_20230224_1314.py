# Generated by Django 3.2.18 on 2023-02-24 13:14
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("diagnostic_word", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            "DROP TABLE IF EXISTS django_docx_template_docxtemplate;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
