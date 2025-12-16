from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("home", "0018_alter_satisfactionformentry_nps_and_more"),
    ]

    operations = [
        migrations.DeleteModel(
            name="AliveTimeStamp",
        ),
    ]
