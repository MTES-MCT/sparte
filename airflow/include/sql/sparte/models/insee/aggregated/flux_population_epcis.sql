{{ config(materialized='table') }}

{{
    merge_flux_population_by_admin_level(
        'epci',
        'code_epci'
    )
}}
