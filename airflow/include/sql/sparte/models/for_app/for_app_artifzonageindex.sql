{{ config(materialized="table", docs={"node_color": "purple"}) }}

select
    land_id,
    land_type,
    departements,
    index,
    years,
    zonage_surface,
    indicateur_surface as artificial_surface,
    zonage_type,
    zonage_count,
    indicateur_percent as artificial_percent
from
    {{ ref("artif_zonage_land_by_index") }}
