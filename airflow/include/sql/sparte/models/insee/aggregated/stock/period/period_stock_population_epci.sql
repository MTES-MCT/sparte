{{ config(materialized='table') }}

{{ merge_stock_population_by_admin_level('epci') }}
