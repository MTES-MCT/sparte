
{{ config(materialized='table') }}

SELECT
    id,
    source_id,
    name
FROM
    {{ source('public', 'app_region') }}
