{{
    config(
        materialized="table") }}

SELECT
    land_id,
    land_type,
    unnest(departements) as departement
FROM
    {{ ref("land") }}
