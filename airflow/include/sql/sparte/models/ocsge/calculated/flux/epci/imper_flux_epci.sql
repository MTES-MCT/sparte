{{
    config(
        materialized="table",
        indexes=[{"columns": ["epci"], "type": "btree"}],
    )
}}

{{ merge_imper_commune_flux_by_admin_level('epci')}}
