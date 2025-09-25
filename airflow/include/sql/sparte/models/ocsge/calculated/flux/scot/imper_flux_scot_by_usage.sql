{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}


{{ merge_imper_commune_flux_by_sol_and_admin_level("scot", "usage") }}
