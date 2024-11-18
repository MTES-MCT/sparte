{{ config(materialized='table') }}

{{ merge_majic_by_admin_level('id_scot', 'scot') }}
