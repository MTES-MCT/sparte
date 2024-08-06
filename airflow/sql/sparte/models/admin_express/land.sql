
{{ config(materialized='view') }}

SELECT
    commune.insee_com AS land_id,
    'COMMUNE' AS land_type,
    geom
FROM
    {{ source('public', 'commune') }} AS commune
UNION
SELECT
    departement.insee_dep AS land_id,
    'DEPARTEMENT' AS land_type,
    geom
FROM
    {{ source('public', 'departement') }} AS departement
UNION
SELECT
    region.insee_reg AS land_id,
    'REGION' AS land_type,
    geom
FROM
    {{ source('public', 'region') }} AS region
UNION
SELECT
    epci.code_siren AS land_id,
    'EPCI' AS land_type,
    geom
FROM
    {{ source('public', 'epci') }} AS epci
