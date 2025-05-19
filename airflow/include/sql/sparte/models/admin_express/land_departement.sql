{{
    config(
        materialized="table") }}

with unnested_departements as (
    SELECT
        land_id,
        land_type,
        unnest(departements) as departement
    FROM
        {{ ref("land") }}
)
SELECT
    land_id,
    land_type,
    departement,
    departement_table.name as departement_name
FROM
    unnested_departements
LEFT JOIN
    {{ ref('departement') }} as departement_table
ON
    departement = departement_table.code
