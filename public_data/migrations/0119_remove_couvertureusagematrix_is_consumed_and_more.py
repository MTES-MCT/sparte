# Generated by Django 4.2.7 on 2024-02-21 18:47

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0118_alter_couvertureusagematrix_unique_together"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="couvertureusagematrix",
            name="is_consumed",
        ),
        migrations.RemoveField(
            model_name="couvertureusagematrix",
            name="is_natural",
        ),
    ]
