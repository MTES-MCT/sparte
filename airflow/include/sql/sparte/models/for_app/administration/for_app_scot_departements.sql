{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    row_number() over() as id,
    scot.id_scot AS scot_id,
    departement.code as departement_id
FROM
    {{ ref('scot') }} as scot
INNER JOIN
    {{ ref('departement') }} as departement
ON
    ST_Intersects(scot.geom, departement.geom)
    AND NOT ST_Touches(scot.geom, departement.geom)
