"""
Teste la commande ogr2ogr du dag `update_app`.

Elle remplace le wrapper `pygdaltools` par un appel direct. Les deux cas nominaux
attendus ci-dessous sont repris tels quels de runs réels (`ogr2ogr_request` dans les
logs de tâche), pour que le remplacement reste iso-comportement.

`copy_table_from_datawarehouse_to_app` appelle le constructeur deux fois : une fois avec les DSN
réels, une fois avec leur forme expurgée. Seule la seconde est journalisée et renvoyée
en XCom — un mot de passe qui fuirait ici atterrirait dans la base de métadonnées
Airflow et dans l'interface.
"""

from dags.update_app import DEFAULT_GEOM_TYPE, OGR2OGR_PATH, build_ogr2ogr_command
from gdaltools import PgConnectionString

TARGET_DSN = "PG:host='app' port='5432' user='app' dbname='app' password='secret-app'"
SOURCE_DSN = "PG:host='dw' port='5432' user='dw' dbname='dw' password='secret-dw'"

COLONNES_JSONB = {
    "friche_status_details": "jsonb",
    "conso_details": "jsonb",
    "logements_vacants_status_details": "jsonb",
    "millesimes": "jsonb[]",
    "millesimes_by_index": "jsonb[]",
}


def test_reproduit_la_commande_d_une_table_geometrique():
    """Cas `landfriche` : un geom_type explicite et aucun type de colonne forcé."""
    assert build_ogr2ogr_command(
        from_table="public_for_app.for_app_landfriche",
        to_table="app_swap.public_data_landfriche",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
        geom_type="POINT",
    ) == [
        OGR2OGR_PATH,
        "-overwrite",
        "-f",
        "PostgreSQL",
        "-lco",
        "LAUNDER=YES",
        "-lco",
        "FID=id",
        "--config",
        "PG_USE_COPY",
        "YES",
        "--config",
        "OGR_TRUNCATE",
        "NO",
        "-nln",
        "app_swap.public_data_landfriche",
        "-nlt",
        "POINT",
        TARGET_DSN,
        SOURCE_DSN,
        "public_for_app.for_app_landfriche",
    ]


def test_reproduit_la_commande_d_une_table_a_colonnes_jsonb():
    """Cas `land` : COLUMN_TYPES s'intercale entre LAUNDER et FID, dans cet ordre."""
    assert build_ogr2ogr_command(
        from_table="public_for_app.for_app_land",
        to_table="app_swap.public_data_land",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
        custom_columns_type=COLONNES_JSONB,
    ) == [
        OGR2OGR_PATH,
        "-overwrite",
        "-f",
        "PostgreSQL",
        "-lco",
        "LAUNDER=YES",
        "-lco",
        (
            "COLUMN_TYPES=friche_status_details:jsonb,conso_details:jsonb,"
            "logements_vacants_status_details:jsonb,millesimes:jsonb[],millesimes_by_index:jsonb[]"
        ),
        "-lco",
        "FID=id",
        "--config",
        "PG_USE_COPY",
        "YES",
        "--config",
        "OGR_TRUNCATE",
        "NO",
        "-nln",
        "app_swap.public_data_land",
        "-nlt",
        DEFAULT_GEOM_TYPE,
        TARGET_DSN,
        SOURCE_DSN,
        "public_for_app.for_app_land",
    ]


def test_la_destination_precede_la_source():
    """Inverser les deux DSN écrirait dans l'entrepôt au lieu de la base applicative."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
    )
    assert command[-3:] == [TARGET_DSN, SOURCE_DSN, "public_for_app.for_app_landconso"]


def test_sans_geom_type_le_defaut_du_driver_est_utilise():
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
    )
    assert command[command.index("-nlt") + 1] == DEFAULT_GEOM_TYPE


def test_les_dsn_ne_sont_pas_entoures_de_guillemets():
    """La commande part en liste, sans shell : des guillemets littéraux casseraient GDAL."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
    )
    assert all(not argument.startswith('"') for argument in command)


def test_la_forme_expurgee_masque_le_mot_de_passe():
    """Garde-fou sur pygdaltools : `str()` masque, `encode()` non."""
    connection = PgConnectionString(host="app", port="5432", dbname="app", user="app", password="un-vrai-mot-de-passe")
    assert "un-vrai-mot-de-passe" in connection.encode()
    assert "un-vrai-mot-de-passe" not in str(connection)

    safe_command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=str(connection),
        source_dsn=str(connection),
    )
    assert "un-vrai-mot-de-passe" not in " ".join(safe_command)


def test_un_seul_type_de_colonne_n_ajoute_pas_de_virgule_finale():
    """L'implémentation précédente concaténait puis retirait la virgule en trop."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_land_geojson",
        to_table="app_swap.public_data_land_geojson",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
        custom_columns_type={"geojson": "jsonb"},
    )
    assert "COLUMN_TYPES=geojson:jsonb" in command


def test_un_dictionnaire_de_types_vide_n_ajoute_pas_l_option():
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
        custom_columns_type={},
    )
    assert not any(argument.startswith("COLUMN_TYPES=") for argument in command)


def test_les_types_de_colonnes_gardent_leur_ordre_de_declaration():
    """GDAL apparie COLUMN_TYPES par nom, mais un ordre stable garde les logs diffables."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landfrichegeojson",
        to_table="app_swap.public_data_landfrichegeojson",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
        custom_columns_type={
            "geojson_feature_collection": "jsonb",
            "geojson_centroid_feature_collection": "jsonb",
        },
    )
    assert "COLUMN_TYPES=geojson_feature_collection:jsonb,geojson_centroid_feature_collection:jsonb" in command


def test_geom_type_et_types_de_colonnes_coexistent():
    """Aucune table ne combine les deux aujourd'hui, mais rien ne l'interdit."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landfriche",
        to_table="app_swap.public_data_landfriche",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
        geom_type="POINT",
        custom_columns_type={"details": "jsonb"},
    )
    assert command[command.index("-nlt") + 1] == "POINT"
    assert "COLUMN_TYPES=details:jsonb" in command


def test_la_table_de_destination_est_reprise_telle_quelle():
    """`-nln` doit viser le schéma de bascule : y écrire dans `public` annulerait le swap."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
    )
    assert command[command.index("-nln") + 1] == "app_swap.public_data_landconso"


def test_overwrite_est_couple_a_ogr_truncate_no():
    """C'est OGR_TRUNCATE=NO qui fait choisir DROP + CREATE plutôt qu'un TRUNCATE."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
    )
    assert "-overwrite" in command
    assert "-append" not in command
    assert command[command.index("OGR_TRUNCATE") + 1] == "NO"


def test_aucun_argument_n_est_nul():
    """Un None dans la liste ferait lever subprocess avant même d'atteindre GDAL."""
    command = build_ogr2ogr_command(
        from_table="public_for_app.for_app_landconso",
        to_table="app_swap.public_data_landconso",
        target_dsn=TARGET_DSN,
        source_dsn=SOURCE_DSN,
    )
    assert all(isinstance(argument, str) for argument in command)
