# Generated by Django 3.2.5 on 2021-07-10 22:36

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_auto_20210706_2214"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="creation_date",
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name="creation date",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="user",
            name="email_checked",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="email checked"
            ),
        ),
    ]
