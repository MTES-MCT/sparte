{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

{{ merge_artif_commune_flux_by_sol('usage') }}
