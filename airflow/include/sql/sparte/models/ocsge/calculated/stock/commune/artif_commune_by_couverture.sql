{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

{{
    merge_ocsge_indicateur_commune_by_sol(
        indicateur_commune_table='artif_commune',
        where_conditions=["is_artificial"],
        sol="couverture"
    )
}}
