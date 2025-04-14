{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    artif_land.land_id,
    artif_land.land_type,
    artif_land.departement,
    artif_land.index as millesime_index,
    artif_land.year,
    artificial_surface as surface,
    percent
FROM
    {{ ref("artif_land") }}
