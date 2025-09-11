{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["code"], "type": "btree"},
        ],
    )
}}

{{
    merge_ocsge_indicateur_zonage_commune_by_admin_level(
        indicateur='imper',
        group_by_column='epci',
    )
}}
