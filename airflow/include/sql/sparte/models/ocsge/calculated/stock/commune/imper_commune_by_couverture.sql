{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

{{
    merge_ocsge_indicateur_commune_by_sol(
        indicateur_commune_table='imper_commune',
        where_conditions=["is_impermeable"],
        sol="couverture"
    )
}}
