# Generated by Django 3.2.18 on 2023-03-02 15:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_alter_user_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'ordering': ['email'], 'verbose_name': 'Utilisateur'},
        ),
        migrations.AddField(
            model_name='user',
            name='organism_group',
            field=models.CharField(blank=True, max_length=250, null=True, verbose_name="Groupe d'organisme"),
        ),
    ]
