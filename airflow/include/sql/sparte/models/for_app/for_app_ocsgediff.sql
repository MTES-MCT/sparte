{{ config(materialized="table", docs={"node_color": "purple"}) }}

select
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
    new_is_artificial as is_new_artif,
    new_not_artificial as is_new_natural,
    new_is_impermeable as is_new_impermeable,
    new_not_impermeable as is_new_not_impermeable,
    st_transform(geom, 4326) as mpoly
from {{ ref("difference") }}
