{{
    config(
        materialized="table",
        indexes=[{"columns": ["departement"], "type": "btree"}],
    )
}}

{{ merge_artif_commune_flux_by_admin_level('departement') }}
