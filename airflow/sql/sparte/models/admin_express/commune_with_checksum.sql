
{{ config(materialized='table') }}

SELECT *, md5(commune::text) FROM {{ source('public', 'commune') }} AS commune
