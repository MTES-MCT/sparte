{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    uuid,
    code_cs as couverture,
    code_us as usage,
    year,
    ST_Transform(geom, 4326) as mpoly,
    id as id_source,
    is_artificial,
    surface,
    srid_source,
    departement,
    is_impermeable
FROM
    {{ ref("occupation_du_sol") }}
