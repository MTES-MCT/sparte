{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["region"], "type": "btree"},
        ],
    )
}}

{{ merge_imper_commune_by_sol_and_admin_level("region", "couverture") }}
