{{
    config(
        materialized="table",
        indexes=[{"columns": ["scot"], "type": "btree"}],
    )
}}

{{ merge_imper_commune_flux_by_sol_and_admin_level("scot", "usage") }}
