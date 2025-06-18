{{ config(materialized='table') }}

SELECT
    id,
    email,
    created_date,
    confirmation_date
FROM
    {{ source('public', 'app_newsletter') }}
