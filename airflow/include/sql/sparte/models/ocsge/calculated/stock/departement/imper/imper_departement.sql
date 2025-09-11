{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["code"], "type": "btree"},
        ],
    )
}}

{{ merge_ocsge_indicateur_commune_by_admin_level("imper", "commune.departement") }}
