# Generated by Django 3.2.5 on 2021-09-23 23:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0012_auto_20210920_2015'),
    ]

    operations = [
        migrations.AlterField(
            model_name='planemprise',
            name='plan',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emprise_set', to='project.plan'),
        ),
    ]
