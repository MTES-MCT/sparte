{{ config(materialized='table') }}

SELECT
    '{{ var("NATION") }}' as nation,
    sum(surface) as surface,
    year,
    sum(total) as total,
    sum(activite) as activite,
    sum(habitat) as habitat,
    sum(mixte) as mixte,
    sum(route) as route,
    sum(ferroviaire) as ferroviaire,
    sum(inconnu) as inconnu
FROM
    {{ ref('flux_consommation_region') }}
GROUP BY
    year
