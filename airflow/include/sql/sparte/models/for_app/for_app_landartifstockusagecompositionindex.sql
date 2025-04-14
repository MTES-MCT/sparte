{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    land_id,
    land_type,
    departements,
    years,
    percent_of_land,
    artificial_surface as surface,
    usage,
    percent_of_artif,
    index as millesime_index
FROM
    {{ ref("artif_land_by_usage_by_index") }}
