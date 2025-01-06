{{ config(materialized='table') }}

with unfiltered_epci as (
SELECT
    epci.name as epci_name,
    commune.epci as epci_code,
    year,
    sum(1) as commune_count,
    sum(total) as total,
    sum(vacants) as vacants,
    CASE
        WHEN sum(total) = 0 THEN 0
        ELSE sum(vacants) / sum(total) * 100
    END as taux_vacants

FROM
    {{ ref('rpls_commune') }} as rpls_commune -- already cog safe
LEFT JOIN
    {{ ref('commune') }} as commune
ON
    commune.code = rpls_commune.commune_code
LEFT JOIN
    {{ ref('epci') }} as epci
ON
    epci.code = commune.epci
GROUP BY
    commune.epci,
    epci.name,
    year
)

SELECT
    epci_name,
    epci_code,
    year,
    total,
    vacants,
    taux_vacants
FROM unfiltered_epci
WHERE commune_count = (SELECT count(*) FROM {{ ref('commune') }} WHERE epci = epci_code)
