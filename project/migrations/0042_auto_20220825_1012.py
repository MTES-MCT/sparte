# Generated by Django 3.2.15 on 2022-08-25 10:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0041_auto_20220801_1445"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="planemprise",
            name="plan",
        ),
        migrations.DeleteModel(
            name="Plan",
        ),
        migrations.DeleteModel(
            name="PlanEmprise",
        ),
    ]
