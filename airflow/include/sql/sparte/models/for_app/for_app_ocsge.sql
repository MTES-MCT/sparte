{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    uuid,
    code_cs                  AS couverture,
    code_us                  AS usage,
    year,
    id                       AS id_source,
    is_artificial,
    surface,
    srid_source,
    departement,
    is_impermeable,
    ST_TRANSFORM(geom, 4326) AS mpoly
FROM
    {{ ref("occupation_du_sol") }}
