{{ config(materialized='table') }}

{{
    merge_majic_by_admin_level(
        'region',
        'code_region'
    )
}}
