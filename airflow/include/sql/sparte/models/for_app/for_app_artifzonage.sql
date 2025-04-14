{{ config(materialized="table", docs={"node_color": "purple"}) }}

select
    land_id,
    land_type,
    departement,
    index,
    year,
    surface,
    artificial_surface,
    zonage_type,
    zonage_count,
    artificial_percent
from
    {{ ref("artif_zonage_land") }}
