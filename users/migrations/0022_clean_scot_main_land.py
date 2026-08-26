from django.db import migrations

# Les SCoT rattachés aux utilisateurs proviennent d'un ancien référentiel : leurs
# identifiants sont courts (`5`, `215`, `2112`…) alors que `public_data_land`
# n'expose plus que des SIREN à 9 chiffres. Aucune correspondance entre les deux
# nomenclatures n'existe dans le projet, ces rattachements sont donc irrécupérables.
# En production, les 116 utilisateurs concernés étaient tous invalides.
CLEAN_SQL = """
UPDATE users_user
SET main_land_id = NULL,
    main_land_type = NULL
WHERE main_land_type = 'SCOT';
"""


class Migration(migrations.Migration):
    """Vide le territoire principal des utilisateurs rattachés à un SCoT."""

    dependencies = [
        ("users", "0021_alter_user_main_land_type"),
    ]

    operations = [
        migrations.RunSQL(
            sql=CLEAN_SQL,
            # Irréversible : les anciens identifiants ne sont pas reconstituables.
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
