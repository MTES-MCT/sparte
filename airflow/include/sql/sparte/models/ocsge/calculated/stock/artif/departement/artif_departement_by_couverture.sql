{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}


{{ merge_artif_commune_by_sol_and_admin_level("departement", "couverture") }}
