{{ config(materialized='table') }}

{{
    merge_flux_population_by_admin_level(
        'id_scot',
        'scot'
    )
}}
