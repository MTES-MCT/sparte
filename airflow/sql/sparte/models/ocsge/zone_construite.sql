{{ config(materialized='table') }}

WITH latest_loaded_date AS (
    SELECT
        year,
        departement,
        MAX(loaded_date) AS max_loaded_date
    FROM
        {{ source('public', 'ocsge_zone_construite') }}
    GROUP BY
        year,
        departement
)
SELECT
    ocsge.loaded_date,
    ocsge.id,
    ocsge.year,
    ocsge.departement,
    ocsge.geom
FROM
    {{ source('public', 'ocsge_zone_construite') }} as ocsge
JOIN
    latest_loaded_date AS ld
ON
    ocsge.year = ld.year
    AND ocsge.departement = ld.departement
    AND ocsge.loaded_date = ld.max_loaded_date
