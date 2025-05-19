{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

{{
    merge_ocsge_indicateur_commune_by_sol_and_admin_level(
        indicateur="artif",
        group_by_column="departement",
        sol="usage"
    )
}}
