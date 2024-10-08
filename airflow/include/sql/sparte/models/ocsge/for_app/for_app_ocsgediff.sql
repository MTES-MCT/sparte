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
    ST_Transform(geom, 4326) as mpoly,
    surface,
    srid_source,
    departement,
    new_is_artificial as is_new_artif,
    new_not_artificial as is_new_natural,
    new_is_impermeable as is_new_impermeable,
    new_not_impermeable as is_new_not_impermeable
FROM
    {{ ref("difference") }}
