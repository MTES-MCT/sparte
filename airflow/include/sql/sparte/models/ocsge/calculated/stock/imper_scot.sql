{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["scot"], "type": "btree"},
        ],
    )
}}

{{ merge_imper_commune_by_admin_level("scot") }}
