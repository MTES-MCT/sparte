{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    land_id,
    land_type,
    departements,
    index as millesime_index,
    years,
    surface,
    percent,
    flux_surface,
    flux_percent,
    flux_previous_years
FROM
    {{ ref("artif_land_by_index") }}
