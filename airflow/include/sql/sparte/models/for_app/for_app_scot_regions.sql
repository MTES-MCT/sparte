{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    row_number() over() as id,
    scot.id_scot AS scot_id,
    region.code as region_id
FROM
    {{ ref('scot') }} as scot
INNER JOIN
    {{ ref('region') }} as region
ON
    ST_Intersects(scot.geom, region.geom)
