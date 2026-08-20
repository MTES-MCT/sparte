{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["code"], "type": "btree"},
        ],
    )
}}

{{
    merge_ocsge_indicateur_zonage_by_commune_mapping(
        indicateur='imper',
        code_expression='mapping.custom_land_id',
        mapping_model='commune_custom_land',
    )
}}
