{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

{{ merge_imper_commune_flux_by_sol('couverture') }}
