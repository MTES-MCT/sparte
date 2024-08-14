
{{ config(materialized='table') }}

SELECT
    code_cs as couverture,
    code_us as usage,
    year,
    ST_Transform(geom, 4326) as mpoly,
    id as id_source,
    is_artificial,
    surface,
    2154 as srid_source,
    departement,
    is_impermeable
FROM
    {{ ref("occupation_du_sol") }}
