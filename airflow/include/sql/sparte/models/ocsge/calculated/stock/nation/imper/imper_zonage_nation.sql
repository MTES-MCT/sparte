{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

{{
    merge_ocsge_indicateur_zonage_by_commune_mapping(
        indicateur='imper',
        code_expression="'" ~ var('NATION') ~ "'",
    )
}}
