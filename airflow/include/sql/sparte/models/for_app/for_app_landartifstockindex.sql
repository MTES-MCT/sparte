{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    land_id,
    land_type,
    departements,
    index as millesime_index,
    years,
    artificial_surface as surface,
    percent
FROM
    {{ ref("artif_land_by_index") }}
