{{ config(materialized="table") }}

{% set surface_france = 641184 %}
-- Source : https://fr.wikipedia.org/wiki/Superficie_de_la_France

SELECT
    departement.code as code,
    departement.name as name,
    departement.surface / 1000000.0 as surface_km2,
    departement.surface / 1000000.0 * 100 / {{ surface_france }} as percent_of_france,
    land_ocsge_status.has_ocsge
FROM
     {{ ref('departement')}}
LEFT JOIN
    {{ ref('land_ocsge_status')}}
    ON land_ocsge_status.land_id = departement.code
    AND land_ocsge_status.land_type = 'DEPART'
UNION
SELECT
    '976' as code,
    'Mayotte' as name,
    374.0 as surface_km2,
    374.0 * 100 / {{ surface_france }} as percent_of_france,
    false as has_ocsge
ORDER BY
    code
