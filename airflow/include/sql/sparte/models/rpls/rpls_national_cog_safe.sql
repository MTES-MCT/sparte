{{ config(materialized='table') }}

SELECT * FROM {{ ref('rpls_national') }}
{{ where_commune_not_changed('commune_code', '2022') }}
