{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["departement"], "type": "btree"},
        ],
    )
}}

{{ merge_artif_commune_zonage_by_admin_level("departement") }}
