{{ config(materialized='table') }}

with unfiltered_custom_land as (
SELECT
    clc.custom_land_id as custom_land_code,
    year,
    sum(1) as commune_count,
    sum(total) as total,
    sum(vacants) as vacants,
    CASE
        WHEN sum(total) = 0 THEN 0
        ELSE sum(vacants) / sum(total) * 100
    END as taux_vacants

FROM
    {{ ref('rpls_commune') }} as rpls_commune
INNER JOIN
    {{ ref('commune_custom_land') }} as clc
ON
    clc.commune_code = rpls_commune.commune_code
GROUP BY
    clc.custom_land_id,
    year
)

SELECT
    custom_land_code,
    year,
    total,
    vacants,
    taux_vacants
FROM unfiltered_custom_land
WHERE commune_count = (
    SELECT count(*)
    FROM {{ ref('commune_custom_land') }}
    WHERE custom_land_id = custom_land_code
)
