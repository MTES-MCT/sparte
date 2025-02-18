{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["epci"], "type": "btree"},
        ],
    )
}}

{{ merge_imper_commune_by_admin_level("epci") }}
