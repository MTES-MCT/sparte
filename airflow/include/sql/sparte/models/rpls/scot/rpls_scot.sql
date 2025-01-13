{{ config(materialized='table') }}


SELECT
    max(scot_communes.nom_scot) as scot_name,
    scot_communes.id_scot as scot_code,
    year,
    sum(total) as total,
    sum(vacants) as vacants,
    CASE
        WHEN sum(total) = 0 THEN 0
        ELSE sum(vacants) / sum(total) * 100
    END as taux_vacants

FROM
    {{ ref('rpls_commune') }} as rpls_commune -- already cog safe
LEFT JOIN
    {{ ref('scot_communes') }} as scot_communes
ON
    scot_communes.commune_code = rpls_commune.commune_code
WHERE
    scot_communes.id_scot IS NOT NULL
GROUP BY
    scot_communes.id_scot,
    year
