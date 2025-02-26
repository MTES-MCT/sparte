{{
    config(
        materialized="table",
        indexes=[{"columns": ["region"], "type": "btree"}],
    )
}}

{{ merge_imper_commune_flux_by_admin_level('region')}}
