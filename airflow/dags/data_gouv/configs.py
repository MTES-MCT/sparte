from os import getenv

if getenv("ENVIRONMENT") == "production":
    configs = [
        {
            "dag_id": "create_and_publish_france_impermeabilisation_communes_geopackage",
            "format": "gpkg",
            "filename": "france_impermeabilisation_communes.gpkg",
            "sql_to_layer_name_mapping": {
                "impermeabilisation": "SELECT * FROM public_for_export.commune_imper_by_year"
            },
            "data_gouv_dataset": "67bddc715e3badfc49d5df9b",
            "data_gouv_resource": "b0bbf493-a078-46eb-b901-7d0754bf6e77",
        },
        {
            "dag_id": "create_and_publish_france_impermeabilisation_communes_csv",
            "format": "csv",
            "filename": "france_impermeabilisation_communes.csv",
            "sql": "SELECT * FROM public_for_export.commune_imper_by_year",
            "data_gouv_dataset": "67bddc715e3badfc49d5df9b",
            "data_gouv_resource": "800c36e1-8c12-46af-b495-4689edc40c3b",
        },
        {
            "dag_id": "create_and_publish_france_artificialisation_communes_geopackage",
            "format": "gpkg",
            "filename": "france_artificialisation_communes.gpkg",
            "sql_to_layer_name_mapping": {
                "impermeabilisation": "SELECT * FROM public_for_export.commune_artif_by_year"
            },
            "data_gouv_dataset": "67daf7413e4c8cbd0ff2da24",
            "data_gouv_resource": "7bf29725-6cdc-4f68-a10f-b9a99bf6365e",
        },
        {
            "dag_id": "create_and_publish_part_territoire_francais_couvert_par_ocsge_csv",
            "format": "csv",
            "filename": "part_territoire_francais_couvert_par_ocsge.csv",
            "sql": "SELECT * FROM public_for_export.ocsge_surface_cover_percent",
            "data_gouv_dataset": "68348c9afa867945df5968e5",
            "data_gouv_resource": "3a37cc78-4aa7-4a8e-814f-4e3714eb9a90",
            "frequency": "@weekly",
        },
    ]
else:
    configs = []
