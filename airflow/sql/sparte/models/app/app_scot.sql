
{{ config(materialized='table') }}

SELECT
    id,
    name
FROM
    {{ source('public', 'app_scot') }}
