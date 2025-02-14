{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["epci"], "type": "btree"},
        ],
    )
}}

{{ merge_artif_commune_zonage_by_admin_level("epci") }}
