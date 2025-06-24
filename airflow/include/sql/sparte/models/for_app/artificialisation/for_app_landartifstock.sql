{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    artif_land.land_id,
    artif_land.land_type,
    artif_land.departement,
    artif_land.index as millesime_index,
    artif_land.year,
    {{ m2_to_ha('artif_land.surface') }} as surface,
    artif_land.percent,
    {{ m2_to_ha('artif_land.flux_surface') }} as flux_surface,
    artif_land.flux_percent,
    artif_land.flux_previous_year
FROM
    {{ ref("artif_land") }}
