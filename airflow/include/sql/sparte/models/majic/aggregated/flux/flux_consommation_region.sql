{{ config(materialized='table') }}

select
    commune.region,
    sum(commune.surface) as surface,
    year,
    sum(total) as total,
    sum(activite) as activite,
    sum(habitat) as habitat,
    sum(mixte) as mixte,
    sum(route) as route,
    sum(ferroviaire) as ferroviaire,
    sum(inconnu) as inconnu
FROM
    {{ ref('flux_consommation_commune') }} as flux_consommation
LEFT JOIN
    {{ ref('commune') }} as commune
ON
    commune.code = flux_consommation.commune_code
GROUP BY
    commune.region,
    year
