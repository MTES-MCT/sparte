# Generated by Django 4.2.9 on 2024-03-18 13:24

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="CrispWebhookNotification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("event", models.CharField(max_length=255)),
                ("timestamp", models.DateTimeField()),
                ("data", models.JSONField()),
            ],
        ),
    ]
