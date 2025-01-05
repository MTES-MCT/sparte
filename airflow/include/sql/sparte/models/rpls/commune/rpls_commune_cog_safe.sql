{{ config(materialized='table') }}

SELECT * FROM {{ ref('rpls_national') }}
WHERE commune_code not in
{{ commune_changed_since('2022') }}
