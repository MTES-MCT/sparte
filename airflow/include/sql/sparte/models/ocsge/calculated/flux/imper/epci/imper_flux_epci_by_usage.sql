{{
    config(
        materialized="table",
        indexes=[{"columns": ["epci"], "type": "btree"}],
    )
}}

{{ merge_imper_commune_flux_by_sol_and_admin_level("epci", "usage") }}
