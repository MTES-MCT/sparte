{{ config(materialized='table') }}

{{
    merge_majic_by_admin_level(
        'epci',
        'code_epci'
    )
}}
