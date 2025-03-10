# Generated by Django 4.2.13 on 2024-11-26 11:07

from django.db import migrations, models
import django.db.models.functions.text
from django.db.utils import IntegrityError


def remove_duplicate_emails(apps, schema_editor):
    User = apps.get_model("users", "User")
    users = User.objects.all()

    for user in users:
        user.email = user.email.lower()
        try:
            user.save()
        except IntegrityError:
            user.delete()


class Migration(migrations.Migration):
    atomic = False
    dependencies = [
        ("users", "0011_alter_user_organism"),
    ]

    operations = [
        migrations.RunPython(remove_duplicate_emails),
        migrations.AddConstraint(
            model_name="user",
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower("email"), name="user_email_ci_uniqueness"
            ),
        ),
    ]
