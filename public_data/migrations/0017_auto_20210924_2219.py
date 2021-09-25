# Generated by Django 3.2.5 on 2021-09-24 22:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public_data', '0016_auto_20210924_2137'),
    ]

    operations = [
        migrations.AddField(
            model_name='artificielle2018',
            name='couverture_label',
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name='Libellé couverture du sol'),
        ),
        migrations.AddField(
            model_name='artificielle2018',
            name='usage_label',
            field=models.CharField(blank=True, max_length=254, null=True, verbose_name='Libellé usage du sol'),
        ),
    ]
