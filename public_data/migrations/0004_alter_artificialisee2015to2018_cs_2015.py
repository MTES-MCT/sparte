# Generated by Django 3.2.5 on 2021-08-16 17:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("public_data", "0003_auto_20210816_1716"),
    ]

    operations = [
        migrations.AlterField(
            model_name="artificialisee2015to2018",
            name="cs_2015",
            field=models.CharField(max_length=254, null=True, verbose_name="cs_2015"),
        ),
    ]
