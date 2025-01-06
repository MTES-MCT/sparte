{{ config(materialized='table') }}

SELECT * FROM {{ ref('raw_rpls_commune') }}
WHERE commune_code not in
{{ commune_changed_since('2022') }}
