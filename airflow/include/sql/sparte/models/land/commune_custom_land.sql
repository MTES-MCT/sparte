{{ config(materialized='table') }}

SELECT
    clc.custom_land_id,
    clc.commune_code::varchar as commune_code,
    cl.name as custom_land_name
FROM {{ ref('seed_custom_land_commune') }} clc
INNER JOIN {{ ref('seed_custom_land') }} cl ON cl.id = clc.custom_land_id
