# Generated by Django 3.2.14 on 2022-07-29 15:24

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("project", "0037_auto_20220729_1046"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="territory_name",
            field=models.CharField(blank=True, max_length=15, null=True, verbose_name="Territoire"),
        ),
    ]
