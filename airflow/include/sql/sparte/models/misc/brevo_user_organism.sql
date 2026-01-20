{{ config(materialized='table') }}

SELECT
    UPPER("ORGANISME") as organism,
 "EMAIL" as email
FROM
    {{ source('public', 'brevo_user_organism') }}
