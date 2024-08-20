{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    zonage_checksum as zone_urba_id,
    year,
    max(departement) as departement,
    sum(ST_Area(ST_Transform(geom, 2154))) / 10000 as area
FROM
    {{ ref('occupation_du_sol_zonage_urbanisme') }}
WHERE
    is_artificial = true
GROUP BY
    zonage_checksum,
    year
