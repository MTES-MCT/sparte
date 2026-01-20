{{ config(materialized='table') }}


with commune_status as (
SELECT
    unnest(array_agg(correction_status)) as correction_status,
    commune_code
FROM
    {{ ref('consommation_cog_2024') }}
GROUP BY
    commune_code
ORDER BY
    commune_code
), status_with_collectivite_fields as (
SELECT
    commune_status.correction_status,
    commune.code as commune_code,
    commune.epci,
    commune.departement,
    commune.region,
    commune.scot
FROM
    commune_status
LEFt JOIN
    {{ ref('commune') }} as commune
ON
    commune.code = commune_status.commune_code
), all_status_as_array as (
SELECt
    '{{ var('COMMUNE') }}' as land_type,
    commune_code as land_id,
    string_to_array(correction_status, '') as correction_status
FROM status_with_collectivite_fields
UNION
SELECT
    '{{ var('EPCI') }}' as land_type,
    epci as land_id,
    array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
WHERE epci IS NOT NULL
GROUP By epci
UNION
SELECT
    '{{ var('DEPARTEMENT') }}' as land_type,
    departement as land_id,
     array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
GROUP BY departement
UNION
SELECT
    '{{ var('REGION') }}' as land_type,
    region as land_id,
     array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
GROUP BY region
UNION
SELECT
    '{{ var('SCOT') }}' as land_type,
    scot as land_id,
     array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
WHERE
    scot IS NOT NULL
GROUP BY scot
UNION
SELECT
    '{{ var('CUSTOM') }}' as land_type,
    clc.custom_land_id as land_id,
    array_agg(distinct correction_status) as correction_status
FROM status_with_collectivite_fields
INNER JOIN {{ ref('commune_custom_land') }} as clc
    ON clc.commune_code = status_with_collectivite_fields.commune_code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY clc.custom_land_id
)
SELECT
    land_type,
    land_id,
    CASE
        WHEN ARRAY['UNCHANGED'] @> correction_status THEN 'données_inchangées'
        WHEN ARRAY['MISSING_FROM_SOURCE'] @> correction_status THEN 'données_manquantes'
        WHEN ARRAY['COG_ERROR'] @> correction_status THEN 'données_coriggées'
        WHEN ARRAY['UNCHANGED', 'COG_ERROR'] @> correction_status THEN 'données_partiellement_coriggées'
        WHEN ARRAY['UNCHANGED', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_inchangées_avec_données_manquantes'
        WHEN ARRAY['COG_ERROR', 'MISSING_FROM_SOURCE'] @> correction_status THEN 'données_coriggées_avec_données_manquantes'
        ELSE 'ERROR'
    END as consommation_correction_status
FROM all_status_as_array
