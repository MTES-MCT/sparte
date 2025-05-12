{{
    config(
        materialized="table") }}

SELECT
    land_id,
    land_type,
    land_departement.departement,
    land_departement.departement_name as departement_name,
    year,
    millesimes.index
FROM
    {{ ref('land_departement') }}
LEFT JOIN
    {{ ref('millesimes')}}
ON
    land_departement.departement = millesimes.departement
WHERE
    year is not null
