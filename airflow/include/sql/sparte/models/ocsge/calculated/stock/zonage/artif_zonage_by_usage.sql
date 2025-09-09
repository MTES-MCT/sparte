{{
    config(
        materialized="table",
        indexes=[{"columns": ["zonage_checksum"], "type": "btree"}],
    )
}}

{{
    merge_ocsge_indicateur_zonage_by_sol(
        indicateur_zonage_table='artif_zonage',
        where_conditions=["is_artificial"],
        sol="usage"
    )
}}
