{{ config(materialized="table", docs={"node_color": "purple"}) }}

select
    land_id,
    land_type,
    departements,
    years,
    {{ m2_to_ha('zonage_surface') }} as zonage_surface,
    {{ m2_to_ha('indicateur_surface') }} as artificial_surface,
    zonage_type,
    zonage_count,
    indicateur_percent as artificial_percent,
    index as millesime_index
from
    {{ ref("artif_zonage_land_by_index") }}
