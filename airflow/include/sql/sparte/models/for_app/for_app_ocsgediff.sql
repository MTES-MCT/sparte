{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    uuid,
    year_old,
    year_new,
    cs_new,
    cs_old,
    us_new,
    us_old,
    surface,
    srid_source,
    departement,
    new_is_artificial        AS is_new_artif,
    new_not_artificial       AS is_new_natural,
    new_is_impermeable       AS is_new_impermeable,
    new_not_impermeable      AS is_new_not_impermeable,
    ST_TRANSFORM(geom, 4326) AS mpoly
FROM
    {{ ref("difference") }}
