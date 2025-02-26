{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["departement"], "type": "btree"},
        ],
    )
}}

{{ merge_imper_commune_by_sol_and_admin_level("departement", "usage") }}
