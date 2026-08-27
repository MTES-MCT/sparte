from django.db import migrations


class Migration(migrations.Migration):
    """
    Supprime le modèle Emprise, plus référencé nulle part dans le code.

    La table est droppée via `DROP TABLE IF EXISTS` plutôt que par le `DeleteModel`
    standard : elle a déjà disparu de certains environnements (absente de staging)
    sans qu'aucune migration ne l'ait supprimée. Un `DeleteModel` classique y
    échouerait sur une table inexistante.
    """

    dependencies = [
        ("project", "0124_remove_rnupackagerequest_rnu_package_and_more"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="DROP TABLE IF EXISTS project_emprise CASCADE;",
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.DeleteModel(name="Emprise"),
            ],
        ),
    ]
