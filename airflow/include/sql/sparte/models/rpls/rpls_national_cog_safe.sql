{{ config(materialized='table') }}

SELECT * FROM {{ ref('rpls_national_row_based') }}
{{ where_commune_not_changed('commune_code', '2022') }}
