{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    zonage_checksum                                AS zone_urba,
    year,
    max(departement)                               AS departement,
    sum(st_area(st_transform(geom, srid_source))) / 10000 AS area
FROM
    {{ ref('occupation_du_sol_zonage_urbanisme') }}
WHERE
    is_artificial = true
GROUP BY
    zonage_checksum,
    year
