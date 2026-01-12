{{ config(materialized='table') }}

SELECT
    clc.custom_land_id as custom_land,
    year,
    sum(commune.surface) as surface,
    sum(total) as total,
    sum(activite) as activite,
    sum(habitat) as habitat,
    sum(mixte) as mixte,
    sum(route) as route,
    sum(ferroviaire) as ferroviaire,
    sum(inconnu) as inconnu
FROM
    {{ ref('flux_consommation_commune') }} as flux_consommation
INNER JOIN
    {{ ref('commune_custom_land') }} as clc
    ON clc.commune_code = flux_consommation.commune_code
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.code = flux_consommation.commune_code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id,
    year
