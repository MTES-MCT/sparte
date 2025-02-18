{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["region"], "type": "btree"},
        ],
    )
}}

{{ merge_imper_commune_zonage_by_admin_level("region") }}
