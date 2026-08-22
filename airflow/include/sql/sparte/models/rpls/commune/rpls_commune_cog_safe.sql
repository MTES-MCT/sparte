{{ config(materialized='table') }}

SELECT * FROM {{ ref('raw_rpls_commune') }}
